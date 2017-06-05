// *Requiring the needed modules:
const uuid = require('uuid');
const cry = require('../tools/cry');
const OperationError = require('../tools/operation-error');
const { COLLECTIONS } = require('../repository/model/meta');
const { OP_ERR_CODES } = require('../tools/operation-error-codes');



/**
 * Builds the credentials operations
 * @param  {Mongoose} mongoose The mongoose instance
 * @param  {Object} settings   The settings to configure the credentials operations
 * @return {Object}            The available operations object
 */
module.exports = (mongoose, settings) => {
   // *Getting the collections models:
   const Credential = mongoose.model(COLLECTIONS.CREDENTIAL);



   /**
    * Creates a new user credential in the database
    * @param  {Application} application The application that owns this user credentials
    * @param  {String} username         The credentials username (must be unique)
    * @param  {String} password         The credentials password
    * @return {Promise}                 A promise containing the operation result or an error
    */
   function add(application, username, password, client_secret){
      // TODO check and document client_secret
      try{
         // *Validating the username and password against the configured settings:
         validateUsername(username, settings.username);
         validatePassword(password, settings.password);

         // *Generating the password hash salt:
         const salt = uuid.v4();

         // *Setting the iteration count for the key stretching function:
         const it = 4096;

         // *Hashing the password using the generated salt:
         const hashed_password = cry.pbkdf2Sync('sha256', 256, new Buffer(password, 'utf8'), new Buffer(salt, 'utf8'), it);

         // *Computing the client key and its hashed version:
         const client_key = cry.hmacSync('sha256', new Buffer(client_secret, 'utf8'), hashed_password);
         // *Getting the hashed version of the client key to be stored:
         const hashed_client_key = cry.hashSync('sha256', client_key);

         // *Generating a random server secret:
         const server_secret = uuid.v4();
         // *Computing the server key:
         const server_key = cry.hmacSync('sha256', new Buffer(server_secret, 'utf8'), hashed_password);

         // *Adding a new credential:
         return new Credential({
               username,
               password: hashed_password.toString('hex'),
               salt,
               it,
               client_key: hashed_client_key.toString('hex'),
               server_secret,
               _application: application._id
            })
            .save()
            .then(credential_created => {
               return { id: credential_created._id };
            })
            .catch(err => {
               // *Checking if the error has been thrown by the database:
               if(err.name === 'MongoError'){
                  // *If it has:
                  // *Checking the error code:
                  switch(err.code){
                     // *If the username already exists:
                     case 11000: throw new OperationError(OP_ERR_CODES.CREDENTIALS.USERNAME.EXISTS);
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
    * Validates the username against the given settings
    * @private
    * @param  {String} username The username string
    * @param  {Object} settings The username validation settings
    * @throws {OperationError}  If the validation fails
    */
   function validateUsername(username, settings){
      // *Throwing an operation error if the username isn't a string:
      if(typeof username !== 'string')
         throw new OperationError(OP_ERR_CODES.CREDENTIALS.USERNAME.TYPE, 'Username must be a string');

      // *Returning if there isn't any settings:
      if(!settings) return;

      // *Throwing an operation error if the username is too short:
      if(settings.min_length !== undefined && username.length < settings.min_length)
         throw new OperationError(OP_ERR_CODES.CREDENTIALS.USERNAME.LENGTH, 'Username is too short, it must have at least ' + settings.min_length + ' characters');
      // *Throwing an operation error if the username is too long:
      if(settings.max_length !== undefined && username.length > settings.max_length)
         throw new OperationError(OP_ERR_CODES.CREDENTIALS.USERNAME.LENGTH, 'Username is too long, it must have at most ' + settings.max_length + ' characters');
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
         throw new OperationError(OP_ERR_CODES.CREDENTIALS.PASSWORD.TYPE, 'Password must be a string');

      // *Returning if there isn't any settings:
      if(!settings) return;

      // *Throwing an operation error if the password is too short:
      if(settings.min_length !== undefined && password.length < settings.min_length)
         throw new OperationError(OP_ERR_CODES.CREDENTIALS.PASSWORD.LENGTH, 'Password is too short, it must have at least ' + settings.min_length + ' characters');
      // *Throwing an operation error if the password is too long:
      if(settings.max_length !== undefined && password.length > settings.max_length)
         throw new OperationError(OP_ERR_CODES.CREDENTIALS.PASSWORD.LENGTH, 'Password is too long, it must have at most ' + settings.max_length + ' characters');
   }



   // *Returning the available actions:
   return { add };
};
