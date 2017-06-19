// *Requiring the needed modules:
const uuid = require('uuid');
const crypto = require('crypto');
const xor = require('buffer-xor');
const cry = require('../tools/cry');
const KunlunError = require('../errors/kunlun');
const { COLLECTIONS } = require('../repository/model/meta');
const { KUNLUN_ERR_CODES } = require('../errors/codes');
const SCRAM = require('../tools/scram');



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
      // TODO check if the credentials belongs to the current application
      // *Rejecting into an kunlun error, if the username is not a string:
      if(typeof username !== 'string')
         return Promise.reject(new KunlunError(KUNLUN_ERR_CODES.CHALLENGE.USERNAME.TYPE, 'The username must be a string'));

      // *Rejecting into an kunlun error, if the client_nonce is not a string:
      if(typeof client_nonce !== 'string')
         return Promise.reject(new KunlunError(KUNLUN_ERR_CODES.CHALLENGE.NONCE.TYPE, 'The client nonce must be a string'));

      // *Declaring the credential variable:
      let credential = null;

      // *Searching for a credential with the given username:
      return Credential
         .findOne({ username })
         .select('_id salt it server_secret')
         .exec()

         .then(credential_found => {
            // *Storing the credential found:
            credential = credential_found;
            // *Checking if there is any result:
            if(credential)
               // *If there is:
               // *Returning a random server secret:
               return uuid.v4();
            else
               // *If there isn't:
               // *Throwing a kunlun error, as the username doesn't exist:
               throw new KunlunError(KUNLUN_ERR_CODES.CHALLENGE.USERNAME.NOTFOUND, 'Invalid username');
         })

         .then(server_nonce => {
            // *Creating a new access challenge:
            return new Challenge({
                  client_nonce,
                  server_nonce,
                  _credential: credential._id
               })
               .save();
         })

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
               salt: credential.salt,
               /**
                * The password hash iteration count
                * @type {String}
                */
               it: credential.it,
               /**
                * The generated server secret
                * @type {String}
                */
               server_secret: credential.server_secret,
               /**
                * The client and server nonces combined
                * @type {String}
                */
               combined_nonce: SCRAM.combineNonces(client_nonce, challenge_created.server_nonce)
            };
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
      // *Rejecting into an kunlun error, if the challenge_id is not a string:
      if(typeof challenge_id !== 'string' && !(challenge_id instanceof mongoose.Types.ObjectId))
         return Promise.reject(new KunlunError(KUNLUN_ERR_CODES.CHALLENGE.TYPE, 'The challenge id must be a string or a mongoose ObjectId'));

      let challenge = null;
      let credential = null;

      // *Fetching the provided challenge, only if it hasn't been answered yet:
      return Challenge
         .findOne({ _id: challenge_id, answered: false })
         .select('client_nonce server_nonce _credential')
         .exec()

         .then(challenge_found => {
            // *Setting the current challenge:
            challenge = challenge_found;
            // *Checking if the challenge exists:
            if(challenge)
               // *If it does:
               // *Searching for the credential related to this challenge:
               return Credential
                  .findOne({ _id: challenge._credential })
                  .select('username password salt it client_key server_secret')
                  .exec();
            else
               // *If it doesn't:
               // *Throwing a kunlun error, as the challenge doesn't exist, or it had been answered before:
               throw new KunlunError(KUNLUN_ERR_CODES.CHALLENGE.NOTFOUND, 'Invalid challenge');
         })

         .then(credential_found => {
            // *Setting the current credential:
            credential = credential_found;
            // *Checking if the credential exists:
            if(credential)
               // *If it does:
               // *Checking the client proof:
               return SCRAM.validateClientProof(
                  client_proof,
                  credential.username,
                  credential.password,
                  credential.salt,
                  credential.it,
                  credential.client_key,
                  challenge.client_nonce,
                  credential.server_secret,
                  challenge.server_nonce);
             else
               // *If it doesn't:
               // *Throwing a kunlun error, as the challenge credential doesn't exist:
               throw new KunlunError(KUNLUN_ERR_CODES.CHALLENGE.USERNAME.NOTFOUND, 'Invalid username');
         })

         .then(server_signature_generator => {
            // *Checking if the signature generator could be created, which means the client proof was valid:
            if(server_signature_generator)
               // *If it could:
               // *Generating the server signature:
               return server_signature_generator.generate();
            else
               // *If it couldn't:
               // *Throwing a kunlun error, as the provided proof isn't matching:
               throw new KunlunError(KUNLUN_ERR_CODES.CHALLENGE.PROOF.CHECK, 'Incorrect proof');
         })

         .then(server_signature => {
            // *Generating a random access token:
            const access_token = uuid.v4();

            // *Adding a new access:
            return new Access({ token: access_token, _credential: credential._id, _challenge: challenge._id })
               .save()
               .then(access_created => {
                  return {
                     /**
                      * The generated access token
                      * @type {String}
                      */
                     token: access_created.token,
                     /**
                      * The calculated server signature, to be verified by the client
                      * @type {Buffer}
                      */
                     server_signature
                  };
               });
         })

         // *Marking the challenge as answered:
         .then(result => markAsAnswered(challenge_id)
               .then(() => result),
            err => markAsAnswered(challenge_id)
               .then(() => Promise.reject(err)))

         .catch(err => {
            // *Checking if the error is due to casting in the database:
            if(err.name === 'CastError'){
               // *If it has:
               // *Checking if the error occurred on the challenge id:
               if((err.model && err.model.modelName === Challenge.modelName) && err.path === '_id')
                  // *if it has:
                  // *Throwing a kunlun error, as the challenge doesn't exist:
                  throw new KunlunError(KUNLUN_ERR_CODES.CHALLENGE.NOTFOUND, 'Invalid challenge');
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
               throw new KunlunError(KUNLUN_ERR_CODES.CHALLENGE.NOTFOUND, 'Invalid challenge');
            }
         });
   }



   // *Returning the available actions:
   return { generateNew, checkAnswer };
};
