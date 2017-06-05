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


   // TODO 'client_nonce' must be utf8 encoded
   function generateNew(username, client_nonce){

      // TODO check client_nonce
      // TODO check the username

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
                     return {
                        id: challenge_created._id,
                        salt: credential_found.salt,
                        it: credential_found.it,
                        server_secret: credential_found.server_secret,
                        combined_nonce
                     };
                  });

            // *Throwing an operation error, as the credentials check have failed:
            throw new OperationError(OP_ERR_CODES.CHALLENGE.CHECK, 'Invalid credentials');
         });
   }


   // TODO 'client_proof' must be base64 encoded
   function checkAnswer(challenge_id, client_proof){
      // TODO check if the client proof can be used by XOR (i.e. if it is a buffer)

      // *Fetching the provided challenge:
      return Challenge
         .findOne({ _id: challenge_id })
         .select('client_nonce server_nonce _credential')
         .exec()
         .then(challenge_found => {
            // *Checking if the challenge exists:
            if(challenge_found){
               // *if it does:
               // TODO remove the challenge if either an error or success happen
               // *Searching for the credential of this challenge:
               return Credential
                  .findOne({ _id: challenge_found._credential })
                  .select('username password salt it client_key server_secret')
                  .exec()
                  .then(credential_found => {
                     // *Checking if the credential exists:
                     if(credential_found){
                        // *If it does:

                        const auth_message = `n=${credential_found.username},r=${challenge_found.client_nonce},r=${challenge_found.client_nonce + challenge_found.server_nonce},s=${credential_found.salt},i=${credential_found.it},k=${credential_found.server_secret},c=${new Buffer('n,,').toString('base64')},r=${challenge_found.client_nonce + challenge_found.server_nonce}`;

                        // *Calculating the client signature, given the hole transmitted message, and the hashed client secret ('client_key'):
                        const calc_client_signature = cry.hmacSync('sha256', new Buffer(auth_message, 'utf8'), new Buffer(credential_found.client_key, 'hex'));
                        const calc_hashed_client_key = cry.hashSync('sha256', xor(calc_client_signature, new Buffer(client_proof, 'base64')));
                        // *Checking if the client is authenticated:
                        const is_client_authenticated = crypto.timingSafeEqual(new Buffer(credential_found.client_key, 'hex'), calc_hashed_client_key);

                        // *Checking if the client gets authenticated:
                        if(is_client_authenticated){
                           // *If it does:
                           // *Calculating the server key:
                           const server_key = cry.hmacSync('sha256', new Buffer(credential_found.server_secret, 'utf8'), new Buffer(credential_found.password, 'hex'));
                           // *Generating the server signature:
                           const server_signature = cry.hmacSync('sha256', new Buffer(auth_message, 'utf8'), server_key);
                           // *Generating a random access token:
                           const access_token = uuid.v4();

                           // *Adding a new access:
                           return new Access({ token: access_token, _credential: credential_found._id, _challenge: challenge_found._id })
                              .save()
                              .then(access_created => {
                                 return {
                                    /**
                                     * @type {String}
                                     */
                                    token: access_token,
                                    /**
                                     * @type {Buffer}
                                     */
                                    server_signature
                                 };
                              });
                        } else{
                           // *If it doesn't get authenticated:
                           throw new OperationError('ECHALLENGE.PROOF', 'Invalid proof');
                        }
                     } else{
                        // TODO credential not found
                        // *This is an unexpected error:
                        throw new OperationError('ECHALLENGE.NOTFOUND', 'Invalid credentials');
                     }
                  });
            } else{
               // TODO challenge not found
               throw new OperationError('ECHALLENGE.NOTFOUND', 'Invalid challenge');
            }
         });
   }



   /**
    * Bufferizes/Stringifies the input message
    * @param  {Buffer|String} message The input message/buffered message
    * @return {Buffer|String}         The output buffer/string
    */
   function buff(message){
      return {
         from(origin_encoding){
            return {
               to(target_encoding){
                  // *Getting the buffer from the message, using the given origin encoding:
                  const buff = new Buffer(message, origin_encoding == 'buffer' ? undefined : origin_encoding);
                  // *returns the result, and only convert to string if the final encoding isn't a buffer:
                  return target_encoding == 'buffer' ? buff : buff.toString(target_encoding);
               }
            };
         }
      };
   }



   // *Returning the available actions:
   return { generateNew, checkAnswer };
};
