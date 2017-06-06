// *Requiring the needed modules:
const uuid = require('uuid');
const crypto = require('crypto');
const xor = require('buffer-xor');
const cry = require('../tools/cry');
const OperationError = require('../tools/operation-error');
const { COLLECTIONS } = require('../repository/model/meta');
const { OP_ERR_CODES } = require('../tools/operation-error-codes');



/**
 * Builds the challenges operations
 * @param  {Mongoose} mongoose The mongoose instance
 * @param  {Object} settings   The settings to configure the challenges operations
 * @return {Object}            The available operations object
 */
module.exports = (mongoose, settings) => {
   // *Getting the collections models:
   const Challenge = mongoose.model(COLLECTIONS.CHALLENGE);
   const Credential = mongoose.model(COLLECTIONS.CREDENTIAL);
   const Access = mongoose.model(COLLECTIONS.ACCESS);



   /**
    * Starts a new SCRAM flow
    *  It's an implementation of the SCRAM's 'server-first-message'
    * @param  {String} username     The username that this new challenge'll be related to
    * @param  {String} client_nonce The client random nonce
    * @return {Promise}             It resolves into the server fist message response, or rejects into an error
    * @see {@link https://tools.ietf.org/html/rfc5802#section-5|RFC5802 - 5. SCRAM Authentication Exchange}
    */
   function generateNew(username, client_nonce){
      // *Rejecting into an operation error, if the username is not a string:
      if(typeof username !== 'string')
         return Promise.reject(new OperationError(OP_ERR_CODES.CHALLENGE.USERNAME.TYPE, 'The username must be a string'));

      // *Rejecting into an operation error, if the client_nonce is not a string:
      if(typeof client_nonce !== 'string')
         return Promise.reject(new OperationError(OP_ERR_CODES.CHALLENGE.NONCE.TYPE, 'The username must be a string'));

      // *Generating a random server nonce:
      const server_nonce = uuid.v4();
      // *Combining the given client nonce with the server one:
      const combined_nonce = client_nonce + server_nonce;

      // *Searching for a credential with the given username:
      return Credential
         .findOne({ username })
         .select('_id salt it server_secret')
         .exec()
         .then(credential_found => {
            // *Checking if there is any result:
            if(credential_found)
               // *If there is:
               // *Creating a new access challenge:
               return new Challenge({
                     client_nonce,
                     server_nonce,
                     _credential: credential_found._id
                  })
                  .save()
                  .then(challenge_created => {
                     // *Returning the server first message:
                     return {
                        /**
                         * The generated challenge instance id
                         * @type {String}
                         */
                        id: challenge_created._id,
                        /**
                         * The password hash salt
                         * @type {String}
                         */
                        salt: credential_found.salt,
                        /**
                         * The password hash iteration count
                         * @type {String}
                         */
                        it: credential_found.it,
                        /**
                         * The generated server secret
                         * @type {String}
                         */
                        server_secret: credential_found.server_secret,
                        /**
                         * The client and server nounces combined
                         * @type {String}
                         */
                        combined_nonce
                     };
                  });
            else
               // *If there isn't:
               // *Throwing an operation error, as the username doesn't exist:
               throw new OperationError(OP_ERR_CODES.CHALLENGE.USERNAME.NOTFOUND, 'Invalid username');
         });
   }



   /**
    * Checks if the challenge answer is correct
    *  It's an implementation of the SCRAM's 'server-final-message'
    * @param  {String|ObjectId} challenge_id The challenge this answer's related to
    * @param  {String} client_proof          The calculated client proof (base64 encoded)
    * @return {Promise}                      It resolves into the server final message response, or rejects into an error
    * @see {@link https://tools.ietf.org/html/rfc5802#section-5|RFC5802 - 5. SCRAM Authentication Exchange}
    */
   function checkAnswer(challenge_id, client_proof){
      // *Rejecting into an operation error, if the challenge_id is not a string:
      if(typeof challenge_id !== 'string' && !(challenge_id instanceof mongoose.Types.ObjectId))
         return Promise.reject(new OperationError(OP_ERR_CODES.CHALLENGE.TYPE, 'The challenge id must be a string or a mongoose ObjectId'));

      // *Getting the client proof as a buffer:
      client_proof = new Buffer(client_proof, 'base64');

      // *Fetching the provided challenge, only if it hasn't been answered yet:
      return Challenge
         .findOne({ _id: challenge_id, answered: false })
         .select('client_nonce server_nonce _credential')
         .exec()
         .then(challenge_found => {
            // *Checking if the challenge exists:
            if(challenge_found){
               // *If it does:
               // *Searching for the credential related to this challenge:
               return Credential
                  .findOne({ _id: challenge_found._credential })
                  .select('username password salt it client_key server_secret')
                  .exec()
                  .then(credential_found => {
                     // *Checking if the credential exists:
                     if(credential_found){
                        // *If it does:
                        // *Getting the stored hashed client key as a buffer:
                        const hashed_client_key = new Buffer(credential_found.client_key, 'hex');
                        // *Generating the auth message as a buffer:
                        const auth_message = new Buffer(`n=${credential_found.username},r=${challenge_found.client_nonce},r=${challenge_found.client_nonce + challenge_found.server_nonce},s=${credential_found.salt},i=${credential_found.it},k=${credential_found.server_secret},c=${new Buffer('n,,').toString('base64')},r=${challenge_found.client_nonce + challenge_found.server_nonce}`, 'utf8');
                        // *Calculating the expected client signature:
                        const calc_client_signature = cry.hmacSync('sha256', auth_message, hashed_client_key);
                        // *Calculating the expected hashed version of the client key:
                        const calc_hashed_client_key = cry.hashSync('sha256', xor(calc_client_signature, client_proof));

                        // *Checking if the client is able to be authenticated, by comparing the stored hashed client key with the calculated one:
                        if(crypto.timingSafeEqual(hashed_client_key, calc_hashed_client_key)){
                           // *If it is:
                           // *Calculating the server key:
                           const server_key = cry.hmacSync('sha256', new Buffer(credential_found.server_secret, 'utf8'), new Buffer(credential_found.password, 'hex'));
                           // *Generating the server signature:
                           const server_signature = cry.hmacSync('sha256', auth_message, server_key);
                           // *Generating a random access token:
                           const access_token = uuid.v4();

                           // *Adding a new access:
                           return new Access({ token: access_token, _credential: credential_found._id, _challenge: challenge_found._id })
                              .save()
                              .then(access_created => {
                                 return {
                                    /**
                                     * The generated access token
                                     * @type {String}
                                     */
                                    token: access_token,
                                    /**
                                     * The calculated server signature, to be verified by the client
                                     * @type {Buffer}
                                     */
                                    server_signature
                                 };
                              });
                        } else{
                           // *If it isn't:
                           // *Throwing an operational error, as the provided proof isn't matching:
                           throw new OperationError(OP_ERR_CODES.CHALLENGE.PROOF.CHECK, 'Incorrect proof');
                        }
                     } else{
                        // *If it doesn't:
                        // *Throwing an operational error, as the challenge credential doesn't exist:
                        throw new OperationError(OP_ERR_CODES.CHALLENGE.USERNAME.NOTFOUND, 'Invalid username');
                     }
                  })
                  .then(result => markAsAnswered(challenge_id)
                        .then(() => result),
                     err => markAsAnswered(challenge_id)
                        .then(() => Promise.reject(err)));
            } else{
               // *If it doesn't:
               // *Throwing an operation error, as the challenge doesn't exist, or it had been answered before:
               throw new OperationError(OP_ERR_CODES.CHALLENGE.NOTFOUND, 'Invalid challenge');
            }
         })
         .catch(err => {
            // *Checking if the error is due to casting in the database:
            if(err.name === 'CastError'){
               // *If it has:
               // *Checking if the error occurred on the id:
               if(err.path === '_id')
                  // *if it has:
                  // *Throwing an operation error, as the challenge doesn't exist:
                  throw new OperationError(OP_ERR_CODES.CHALLENGE.NOTFOUND, 'Invalid challenge');
            }

            // *Throwing the error again, as it wasn't expected:
            throw err;
         });
   }



   function markAsAnswered(challenge_id){
      return Challenge
         .findOne({ _id: challenge_id })
         .exec()
         .then(challenge_found => {
            if(challenge_found){
               if(challenge_found.answered === false){
                  challenge_found.answered = true;
                  return challenge_found.save();
               } else{
                  return challenge_found;
               }
            } else{
               throw new OperationError(OP_ERR_CODES.CHALLENGE.NOTFOUND, 'Invalid challenge');
            }
         });
   }



   // *Returning the available actions:
   return { generateNew, checkAnswer };
};
