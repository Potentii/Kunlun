// *Requiring the needed modules:
const uuid = require('uuid');
const KunlunError = require('../errors/kunlun');
const { COLLECTIONS } = require('../repository/model/meta');
const { KUNLUN_ERR_CODES } = require('../errors/codes');



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

                     // *Throwing a kunlun error, as the access check have failed:
                     throw new KunlunError(KUNLUN_ERR_CODES.ACCESS.CHECK.TOKEN, 'Invalid access token');
                  });

            // *Throwing a kunlun error, as the access check have failed:
            throw new KunlunError(KUNLUN_ERR_CODES.ACCESS.CHECK.USERNAME, 'Invalid access username');
         });
   }



   // *Returning the routes:
   return { check };
};
