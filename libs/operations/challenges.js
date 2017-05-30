// *Requiring the needed modules:
const uuid = require('uuid');
const cry = require('../tools/cry');
const OperationError = require('../operations/operation-error');
const { COLLECTIONS } = require('../repository/model/meta');



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



   function generateFor(username){
      // *Generating the challenge salt:
      const salt = uuid.v4();

      // *Searching for a credential with the given username:
      return Credential
         .findOne({ username })
         .select('_id')
         .exec()
         .then(credential_found => {
            // *Checking if there is any result:
            if(credential_found)
               // *If there is:
               // *Creating a new access challenge:
               return new Challenge({ salt, _credential: credential_found._id })
                  .save()
                  .then(challenge_created => {
                     return { id: challenge_created._id, salt };
                  });

            // *Throwing an operation error, as the credentials check have failed:
            throw new OperationError('ECHALLENGE.CHECK', 'Invalid credentials');
         })
         .catch(err => errors.send(res, err));
   }



   function answer(id, hashed_password){

   }



   // *Returning the available actions:
   return { generateFor };
};
