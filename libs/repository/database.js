// *Requiring the needed modules:
const mongoose = require('mongoose');
const model_adapter = require('./model/adapter');

// *Setting up the internal mongoose promise engine:
mongoose.Promise = Promise;



/**
 * Connects to the database, and sets up the data model
 * @param  {object} settings             The settings to configure the database
 * @param  {string} settings.host        The database hostname
 * @param  {string} settings.database    The database schema
 * @param  {string|number} settings.port The database port (The mongodb default is 27017)
 * @param  {string} settings.user        The database username
 * @param  {string} settings.pass        The database password
 * @return {Promise}                     It resolves into the mongoose instance, or it rejects if some error happens
 */
function connectAndSync(settings){
   // *Returning the connection and model sync promise chain:
   return connect(settings)
      // *Syncing the database model:
      .then(() => sync())
      // *Appending the mongoose in the chain:
      .then(() => mongoose);
}



/**
 * Connects to the database
 * @param  {object} settings             The settings to configure the database
 * @param  {string} settings.host        The database hostname
 * @param  {string} settings.database    The database schema
 * @param  {string|number} settings.port The database port (The mongodb default is 27017)
 * @param  {string} settings.user        The database username
 * @param  {string} settings.pass        The database password
 * @return {Promise}                     It resolves into the mongoose instance, or it rejects if some error happens
 */
function connect({ host = '127.0.0.1', database, port = '27017', user, pass }){
   // *Connecting and returning the promise chain:
   return mongoose.connect(host, database, port, {
         user,
         pass,
         server: {poolSize: 4},
         promiseLibrary: Promise
      })
      // *Appending the mongoose in the chain:
      .then(() => mongoose);
}



/**
 * Sets up the data model
 */
function sync(){
   // *Applying the model:
   model_adapter.apply(mongoose);
}



/**
 * Disconnects from the database
 * @return {Promise} Resolves if it goes ok, or rejects if an error has happened
 */
function disconnect(){
   // *Disconnecting:
   return mongoose.disconnect();
}



// *Exporting this module:
module.exports = {
   connectAndSync,
   connect,
   disconnect
};
