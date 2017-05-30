// *Requiring the needed modules:
const uuid = require('uuid');
const OperationError = require('../operations/operation-error');
const { COLLECTIONS } = require('../repository/model/meta');



/**
 * Builds the accesses operations
 * @param  {Mongoose} mongoose The mongoose instance
 * @param  {Object} settings   The settings to configure the accesses operations
 * @return {Object}            The available operations object
 */
module.exports = (mongoose, settings) => {
   // *Getting the collections models:
   const Access = mongoose.model(COLLECTIONS.ACCESS);
   const Credential = mongoose.model(COLLECTIONS.CREDENTIAL);



   function check(application, username, token){
      // *Searching for the credential that has the given username:
      return Credential
         .findOne({ username })
         .exec()
         .then(credential_found => {
            // *Checking if there is any result:
            if(credential_found)
               // *If there is:
               // *Searching for the access that references the credential and has the given token:
               return Access
                  .findOne({ token, _credential: credential_found._id })
                  .exec()
                  .then(access_found => {
                     // *Checking if there is any result:
                     if(access_found)
                        // *If there is:
                        // *Returning the access credential:
                        return credential_found;

                     // *Throwing an operation error, as the access check have failed:
                     throw new OperationError('EACCESS.CHECK', 'Invalid access token');
                  });

            // *Throwing an operation error, as the access check have failed:
            throw new OperationError('EACCESS.CHECK', 'Invalid access username');
         });
   }



   // *Returning the routes:
   return { check };
};
