// *Requiring the needed modules:
const uuid = require('uuid');
const cry = require('../tools/cry');
const SCRAM = require('../tools/scram');
const KunlunError = require('../errors/kunlun');
const conns = require('../repository/connections');
const { COLLECTIONS } = require('../repository/model/meta');
const { KUNLUN_ERR_CODES } = require('../errors/codes');



/**
 * Builds the credentials operations
 * @param  {Kunlun} kunlun   The Kunlun module instance
 * @param  {Object} settings The settings to configure the credentials operations
 * @return {Object}          The available operations object
 */
module.exports = (kunlun, settings) => {



   /**
    * Creates a new user credential in the database
    * @param  {String} application_name The application name that owns this user credentials
    * @param  {String} username         The credentials username (must be unique)
    * @param  {String} password         The credentials password
    * @return {Promise}                 A promise containing the operation result or an error
    */
   function add(application_name, username, password){
      try{
         // *Validating the username and password against the configured settings:
         validateUsername(username, settings.username);
         validatePassword(password, settings.password);

         return SCRAM.generateChallengeable(password)
            .then(challengeable => {
               // *Getting the collections models:
               const Credential = conns.get(conns.NAMES.fromApplication(application_name)).model(COLLECTIONS.CREDENTIAL);

               // *Adding a new credential:
               return new Credential({
                     username:      username,
                     password:      challengeable.hashed_password.toString('hex'),
                     salt:          challengeable.salt,
                     it:            challengeable.it,
                     /*client_key:    challengeable.hashed_client_key.toString('hex'),*/
                     server_secret: challengeable.server_secret
                  })
                  .save();
            })

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
                     case 11000: throw new KunlunError(KUNLUN_ERR_CODES.CREDENTIALS.USERNAME.EXISTS);
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
    * @throws {KunlunError}  If the validation fails
    */
   function validateUsername(username, settings){
      // *Throwing a kunlun error if the username isn't a string:
      if(typeof username !== 'string')
         throw new KunlunError(KUNLUN_ERR_CODES.CREDENTIALS.USERNAME.TYPE, 'Username must be a string');

      // *Returning if there isn't any settings:
      if(!settings) return;

      // *Throwing a kunlun error if the username is too short:
      if(settings.min_length !== undefined && username.length < settings.min_length)
         throw new KunlunError(KUNLUN_ERR_CODES.CREDENTIALS.USERNAME.LENGTH, 'Username is too short, it must have at least ' + settings.min_length + ' characters');
      // *Throwing a kunlun error if the username is too long:
      if(settings.max_length !== undefined && username.length > settings.max_length)
         throw new KunlunError(KUNLUN_ERR_CODES.CREDENTIALS.USERNAME.LENGTH, 'Username is too long, it must have at most ' + settings.max_length + ' characters');
   }



   /**
    * Validates the password against the given settings
    * @private
    * @param  {String} password The password string
    * @param  {Object} settings The password validation settings
    * @throws {KunlunError}  If the validation fails
    */
   function validatePassword(password, settings){
      // *Throwing a kunlun error if the password isn't a string:
      if(typeof password !== 'string')
         throw new KunlunError(KUNLUN_ERR_CODES.CREDENTIALS.PASSWORD.TYPE, 'Password must be a string');

      // *Returning if there isn't any settings:
      if(!settings) return;

      // *Throwing a kunlun error if the password is too short:
      if(settings.min_length !== undefined && password.length < settings.min_length)
         throw new KunlunError(KUNLUN_ERR_CODES.CREDENTIALS.PASSWORD.LENGTH, 'Password is too short, it must have at least ' + settings.min_length + ' characters');
      // *Throwing a kunlun error if the password is too long:
      if(settings.max_length !== undefined && password.length > settings.max_length)
         throw new KunlunError(KUNLUN_ERR_CODES.CREDENTIALS.PASSWORD.LENGTH, 'Password is too long, it must have at most ' + settings.max_length + ' characters');
   }



   // *Returning the available actions:
   return { add };
};
