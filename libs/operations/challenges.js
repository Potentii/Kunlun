// *Requiring the needed modules:
const uuid = require('uuid');
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
            throw new OperationError(OP_ERR_CODES.CHALLENGE.CHECK, 'Invalid credentials');
         })
         .catch(err => errors.send(res, err));
   }



   function answer(id, hashed_password){
      // *Fetching the provided challenge:
      return Challenge
         .findOne({ _id: id })
         .select('salt _credential')
         .exec()
         .then(challenge_found => {
            // *Checking if the challenge exists:
            if(challenge_found){
               // *if it does:
               // *Searching for the credential of this challenge:
               return Credential
                  .findOne({ _id: challenge_found._credential })
                  .select('password')
                  .exec()
                  .then(credential_found => {
                     // *Checking if the credential exists:
                     if(credential_found){
                        // *If it does:

                        // *Salting and hashing the actual password:
                        const hashed_given_password = cry.hash('utf8', 'hex', 'sha256', admin_found.salt + password);
                        // *Checking if the hashes matches:
                        // TODO do this with length constant comparison:
                        if(admin_found.password === hashed_given_password)
                           // *If they match:
                           // *Returning the admin user instance:
                           return admin_found;

                        // *Unencrypting the credential's password referenced by the provided username:
                        const actual_password = cry.decrypt('utf8', 'hex', 'aes192', credential_found.password, secret_found.key);
                        // *Unenncrypting the provided password:
                        const given_password = cry.decrypt('utf8', 'hex', 'aes192', salted_password, challenge_found.salt);

                        // *Checking if the unencrypted passwords matches:
                        if(actual_password === given_password){
                           // *If they do:
                           // *Generating a random access token:
                           const token = uuid.v4();

                           // *Adding a new access:
                           return new Access({ token, _credential: credential_found._id, _challenge: challenge_found._id })
                              .save()
                              .then(access_created => {
                                 // *Sending a '201 CREATED' response:
                                 res.status(201).json({ token }).end();
                              });
                        } else{
                           // *If they don't match:
                           // *Sending a '401 UNAUTHORIZED' response:
                           res.status(401).json({ message: 'Credentials don\'t match' }).end();
                        }
                     } else{
                        // *If it does not exist anymore:
                        // *Sending a '401 UNAUTHORIZED' response:
                        res.status(401).json({ message: 'Credentials don\'t exist anymore' }).end();
                     }
                  });

            } else{
               // *if it doesn't exist:
               // *Sending a '401 UNAUTHORIZED' response:
               res.status(401).json({ message: 'Invalid challenge identifier' }).end();
            }
         })
         .catch(err => errors.send(res, err));
   }



   // *Returning the available actions:
   return { generateFor };
};
