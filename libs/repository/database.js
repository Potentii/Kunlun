// *Requiring the needed modules:
const mongoose = require('mongoose');

// *Setting up the internal mongoose promise engine:
mongoose.Promise = Promise;



/**
 * Connects to the database, and sets up the data model
 * @param  {object} settings                   The settings to configure the database
 * @param  {string} settings.host              The database hostname
 * @param  {string} settings.database          The database schema
 * @param  {string|number} settings.port       The database port (The mongodb default is 27017)
 * @param  {string} settings.user              The database username
 * @param  {string} settings.pass              The database password
 * @param  {ModelSynchronizer} synchronizeable A model synchronize instance
 * @return {Promise<Connection>}               It resolves into the mongoose connection, or it rejects if some error happens
 */
function connectAndSync(settings, synchronizeable){
   // *Returning the connection and model sync promise chain:
   return connect(settings)
      // *Synchronizing the database model:
      .then(conn =>
         sync(conn, synchronizeable)
            .then(() => conn));
}



/**
 * Connects to the database
 * @param  {object} settings             The settings to configure the database
 * @param  {string} settings.host        The database hostname
 * @param  {string} settings.database    The database schema
 * @param  {string|number} settings.port The database port (The mongodb default is 27017)
 * @param  {string} settings.user        The database username
 * @param  {string} settings.pass        The database password
 * @return {Promise<Connection>}         It resolves into the mongoose connection, or it rejects if some error happens
 */
function connect({ host = '127.0.0.1', database, port = '27017', user, pass }){
   // *Connecting and returning the promise chain:
   return new Promise((resolve, reject) => {
      try{
         // *Creating a new connection:
         const conn = mongoose.createConnection(host, database, port, {
            user,
            pass,
            server: {
               poolSize: 4
            },
            auth: {
               authdb: 'admin'
            },
            promiseLibrary: Promise
         });

         // *Resolving into the connection:
         resolve(conn);
      } catch(err){
         reject(err);
      }
   });
}



/**
 * Synchronizes the database model on a given connection (i.e. updates the model definitions tied to this connection)
 * @param  {Connection} conn                   The connection
 * @param  {ModelSynchronizer} synchronizeable A model synchronizer
 * @return {Promise}                           Resolves if it goes ok, or rejects if an error has happened
 */
function sync(conn, synchronizeable){
   // *Returning the promise:
   return new Promise((resolve, reject) => {
      try{
         // *Synchronizing the model:
         synchronizeable.sync(conn);
         // *Resolving the promise:
         resolve();
      } catch(err){
         reject(err);
      }
   });
}



/**
 * Disconnects from the given connection
 * @param  {Connection} conn The connection
 * @return {Promise} Resolves if it goes ok, or rejects if an error has happened
 */
function disconnect(conn){
   // *Disconnecting:
   return conn.close();
}



// *Exporting this module:
module.exports = {
   connectAndSync,
   connect,
   sync,
   disconnect
};
