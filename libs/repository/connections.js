// *Getting the database module;
const db = require('./database');



/**
 * The default connections names
 * @enum
 * @readonly
 * @type {Object}
 */
const NAMES = Object.freeze({
   READ:       'read',
   DB_ADMIN:   'db-admin',
   READ_WRITE: 'read-write',
   USER_ADMIN: 'user-admin'
});



/**
 * Maps the connections pools with their names
 * @type {Map<String, Connection>}
 */
const connections = new Map();



/**
 * Registers a connection into the connections map, and connects to it
 * @param  {String} connection_name      The connection name
 * @param  {Object} settings             The connection settings
 * @param  {String} settings.host        The database hostname
 * @param  {String} settings.database    The database schema
 * @param  {String|Number} settings.port The database port (The mongodb default is 27017)
 * @param  {String} settings.user        The database username
 * @param  {String} settings.pass        The database password
 * @return {Promise<Connection>}         A promise that resolves into the generated connect, or rejects if something went wrong
 * @see    {@link NAMES}                 For the list of default connection names
 */
function registerAndConnect(connection_name, settings){
   // *Attempting to connect:
   return db.connect(settings)
      .then(conn => {
         // *Registering the connection for future use:
         connections.set(connection_name, conn);
         // *Returning back the connection in the promise chain:
         return conn;
      });
}



/**
 * Registers a connection, connects to it, and then synchronizes the model
 * @param  {String} connection_name               The connection name
 * @param  {Object} settings                      The connection settings
 * @param  {String} settings.host                 The database hostname
 * @param  {String} settings.database             The database schema
 * @param  {String|Number} settings.port          The database port (The mongodb default is 27017)
 * @param  {String} settings.user                 The database username
 * @param  {String} settings.pass                 The database password
 * @param  {ModelSynchronizer} model_synchronizer A model synchronize instance
 * @return {Promise<Connection>}                  A promise that resolves into the generated connect, or rejects if something went wrong
 * @see    {@link NAMES}                          For the list of default connection names
 */
function registerAndConnectAndSync(connection_name, settings, model_synchronizer){
   // *Attempting to connect and synchronize the model:
   return db.connectAndSync(settings, model_synchronizer)
      .then(conn => {
         // *Registering the connection for future use:
         connections.set(connection_name, conn);
         // *Returning back the connection in the promise chain:
         return conn;
      });
}



/**
 * Synchronizes the database model on a given connection (i.e. updates the model definitions tied to this connection)
 * @param  {Connection|String} conn               The connection or a previous registered connection name
 * @param  {ModelSynchronizer} model_synchronizer A model synchronizer
 * @return {Promise}                              Resolves if it goes ok, or rejects if an error has happened
 */
function sync(conn, model_synchronizer){
   // *Searching the connection by its name, if a string is given:
   if(typeof conn === 'string')
      conn = connections.get(conn);

   // *Synchronizing the model:
   return db.sync(conn, model_synchronizer);
}



/**
 * Retrieves the connection given its name
 * @param  {String} connection_name The connection name
 * @return {Connection}             The found connection, or undefined if it doesn't exist
 * @see    {@link NAMES}            For the list of default connection names
 */
function get(connection_name){
   return connections.get(connection_name);
}



/**
 * Disconnects from a connection
 * @param  {Connection|String} conn The connection or a previous registered connection name
 * @return {Promise}                The disconnection promise
 */
function disconnect(conn){
   // *Searching the connection by its name, if a string is given:
   if(typeof conn === 'string')
      conn = connections.get(conn);

   // *Disconnecting from the connection:
   return db.disconnect(conn);
}



/**
 * Disconnects from all the previous registered connections
 * @return {Promise} The disconnection promise
 */
function disconnectAll(){
   // *Initializing the tasks list:
   const disconnect_tasks = [];

   // *Adding each disconnection promise into the tasks list:
   for(let [ connection_name, conn ] of connections.entries()){
      disconnect_tasks.push(disconnect(conn));
   }

   // *Disconnecting from all the connections:
   return Promise.all(disconnect_tasks);
}



// *Exporting this module:
module.exports = {
   NAMES,
   registerAndConnect,
   registerAndConnectAndSync,
   sync,
   get,
   disconnect,
   disconnectAll
};
