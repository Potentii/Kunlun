// *Requiring the needed modules:
const uuid = require('uuid');
const cry = require('../tools/cry');
const OperationError = require('../operations/operation-error');
const { COLLECTIONS } = require('../repository/model/meta');



/**
 * Builds the credentials operations
 * @param  {Mongoose} mongoose The mongoose instance
 * @param  {Object} settings   The setting top configure the credentials operations
 * @return {Object}            The available operations object
 */
module.exports = (mongoose, settings) => {



   /**
    * Creates a new user credential in the database
    * @param  {Application} application         The application that owns this user credentials
    * @param  {String} username                 The credentials username (must be unique)
    * @param  {String} password                 The credentials password
    * @return {Promise<OperationResult, Error>} A promise containing the operation result or an error
    */
   function add(application, username, password){
      try{
         // *Validating the password against the configured settings:
         validatePassword(password, settings.password);

         // TODO validate the username

         // *Getting the collections models:
         const Credential = mongoose.model(COLLECTIONS.CREDENTIAL);

         // *Generating the password hash salt:
         const salt = uuid.v4();

         // *Hashing the password using the generated salt:
         const hashed_password = cry.hash('utf8', 'hex', 'sha256', salt + password);

         // *Adding a new credential:
         return new Credential({ username, password: hashed_password, _application: application._id, salt })
            .save()
            .then(credential_created => {
               return { id: credential_created._id };
            })
            .catch(err => {
               // *Checking if the error has been thrown by the database:
               if(err.name === 'MongoError'){
                  // *if it has:
                  // *Checking the error code:
                  switch(err.code){
                     // *If the username already exists
                     case 11000: throw new OperationError('EUSERNAME.EXISTS');
                  }
               }
               // *Throwing the error again, as it wasn't expected:
               throw err;
            });

      } catch(err){
         return Promise.reject(err);
      }
   }



   /**
    * Validates the password against the given settings
    * @private
    * @param  {String} password The password string
    * @param  {Object} settings The password validation settings
    * @throws {OperationError}  If the validation fails
    */
   function validatePassword(password, settings){
      // *Throwing an operation error if the password isn't a string:
      if(typeof password !== 'string')
         throw new OperationError('EPASSWORD.UNDEFINED', 'Password must be a string');

      // *Returning if there isn't any settings:
      if(!settings) return;

      // *Throwing an operation error if the password is too short:
      if(settings.min_length !== undefined && password.length < settings.min_length)
         throw new OperationError('EPASSWORD.LENGTH', 'Password is too short, it must have at least ' + settings.min_length + ' characters');
      // *Throwing an operation error if the password is too long:
      if(settings.max_length !== undefined && password.length > settings.max_length)
         throw new OperationError('EPASSWORD.LENGTH', 'Password is too long, it must have at most ' + settings.max_length + ' characters');
      // *Throwing an operation error if the password doesn't match the password regex:
      if(settings.regex && settings.regex.test(password))
         throw new OperationError('EPASSWORD.REGEX', 'Password must pass the regex test');
   }



   // *Returning the available actions:
   return { add };
};
