// *Requiring the needed modules:
const uuid = require('uuid');
const crypto = require('crypto');
const cry = require('../tools/cry');
const KunlunError = require('../errors/kunlun');
const database = require('../repository/database');
const conns = require('../repository/connections');
const { COLLECTIONS } = require('../repository/model/meta');
const { KUNLUN_ERR_CODES } = require('../errors/codes');
const ApplicationModelSynchronizer = require('../repository/model/synchronizer/application-model-synchronizer');



/**
 * Builds the applications operations
 * @param  {Kunlun} kunlun   The Kunlun module instance
 * @param  {Object} settings The settings to configure the applications operations
 * @return {Object}          The available operations object
 */
module.exports = (kunlun, settings) => {
   // *Getting the collections models:
   const Application = conns.get(conns.NAMES.READ_WRITE).model(COLLECTIONS.APPLICATION);



   /**
    * Creates a new client application in the database
    * @param {Admin} admin The admin user that is attempting to create the new application
    * @param {String} name The new application name
    */
   function add(admin, name){

      // TODO create an '_admin' field in Application collection, so the admin creator can be referenced
      // TODO or just create a separated logging collection for that

      // *Generating the application database name:
      const database_name = kunlun.settings.connections.database + '_' + name;

      // *Throwing an kunlun error, if the database name gets larger than the maximum supported by mongo, which is 64 characters:
      if(database_name.length >= 64)
         return Promise.reject(new KunlunError(KUNLUN_ERR_CODES.APPLICATION.NAME.INVALID, 'The application name must have ' + (63 - (kunlun.settings.connections.database.length + 2)) + ' characters or fewer'));

      // *Generating the token:
      const token = uuid.v4();

      // *Generating the token hash salt:
      const salt = uuid.v4();

      // *Hashing the token using the generated salt:
      const hashed_token = cry.hashSync('sha256', new Buffer(salt + token, 'utf8')).toString('hex');

      let id = null;

      // *Adding a new client application:
      return new Application({ name, token: hashed_token, salt, database: database_name })
         .save()
         .then(application_created => {
            // *Storing the created application id:
            id = application_created._id;

            // *Connecting to, and synchronizing the application database using the read-write mongo user:
            return conns.registerAndConnectAndSync(conns.NAMES.fromApplication(name), {
               database: database_name,
               host:     kunlun.settings.connections.host,
               port:     kunlun.settings.connections.port,
               user:     kunlun.settings.connections.roles.read_write.username,
               pass:     kunlun.settings.connections.roles.read_write.password
            }, new ApplicationModelSynchronizer());
         })
         .then(() => {
            // *Returning the data:
            return { id, token };
         })
         .catch(err => {
            // *Checking if the error has been thrown by the database:
            if(err.name === 'MongoError'){
               // *If it has:
               // *Checking the error code:
               switch(err.code){
                  // *If the name already exists:
                  case 11000: throw new KunlunError(KUNLUN_ERR_CODES.APPLICATION.NAME.EXISTS);
               }
            }

            // *Checking if it is a validation error:
            if(err.name === 'ValidationError'){
               // *If it has:
               // *Checking the error kinds for name:
               if(err.errors.name && err.errors.name.kind === 'required')
                  throw new KunlunError(KUNLUN_ERR_CODES.APPLICATION.NAME.MISSING);
            }

            // *Throwing the error again, as it wasn't expected:
            throw err;
         });
   }



   /**
    * Removes an application by its name
    *  It will erase all the application related info, but its administrative logs
    * @param  {Admin} admin             The admin who is trying to do this operation
    * @param  {String} application_name The name of the application to be removed
    * @return {Promise}                 It resolves if everything went fine, or rejects on any error
    */
   function remove(admin, application_name){
      // *Declaring the application variable:
      let application = null;

      // *Searching for applications that has the given name:
      return Application
         .findOne({ name: application_name })
         .exec()
         .then(application_found => {
            // *Storing the found application:
            application = application_found;
            // *Checking if it could find something:
            if(application){
               // *If it could:
               // *Connecting to the application's database:
               return database.connect({
                  database: application.database,
                  host:     kunlun.settings.connections.host,
                  port:     kunlun.settings.connections.port,
                  user:     kunlun.settings.connections.roles.db_admin.username,
                  pass:     kunlun.settings.connections.roles.db_admin.password
               })
               .then(conn => {
                  // *Erasing the database:
                  return conn.dropDatabase()
                     // *Disconnecting from the database:
                     .then(() => database.disconnect(conn));
               });
            } else{
               // *If it couldn't:
               // *Throwing an kunlun error, as no application could be found with the provided name:
               throw new KunlunError(KUNLUN_ERR_CODES.APPLICATION.NAME.NOTFOUND, 'Could\'t find any application with the given name');
            }
         })
         .then(() => {
            // *Removing the application instance:
            return Application
               .remove({ _id: application._id })
               .exec();
         });

         // TODO log this operation
   }



   /**
    * Checks if the given name and token matches
    * @param  {String} name  The application name
    * @param  {String} token The application token (plain text utf8 encoded)
    * @return {Promise}      A promise that resolves if it could be authenticated, or rejects if it couldn't, or if some error occur
    */
   function authenticate(name, token){
      // *Rejecting into an kunlun error, as the given token isn't of the valid type:
      if(typeof token !== 'string')
         return Promise.reject(new KunlunError(KUNLUN_ERR_CODES.APPLICATION.TOKEN.INVALID, 'The given token is not valid'));

      // *Searching for an application with the given name:
      return Application
         .findOne({ name })
         .select('token salt')
         .exec()
         .then(application_found => {
            // *Checking if the search has returned something:
            if(application_found){
               // *If it has:
               // *Hashing the given token using the salt:
               const hashed_given_token = cry.hashSync('sha256', new Buffer(application_found.salt + token, 'utf8'));
               // *Checking whether the credentials matches or not:
               if(!crypto.timingSafeEqual(new Buffer(application_found.token, 'hex'), hashed_given_token))
                  // *If it doesn't match:
                  // *Throwing an kunlun error, as the given token/name doesn't match:
                  throw new KunlunError(KUNLUN_ERR_CODES.APPLICATION.TOKEN.INCORRECT, 'The given token doesn\'t matches the actual one');
            } else{
               // *If it hasn't found anything:
               // *Throwing an kunlun error, as the given application name doesn't exist:
               throw new KunlunError(KUNLUN_ERR_CODES.APPLICATION.NAME.NOTFOUND, 'There isn\'t any application with the given name');
            }
         });
   }



   // *Returning the routes:
   return { add, remove, authenticate };
};
