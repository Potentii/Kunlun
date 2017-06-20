// *Requiring the needed modules:
const connections = require('./repository/connections');
const Kunlun = require('./kunlun');



/**
 * Sets up and deploy the Kunlun service
 * @param  {Object} settings The kunlun settings object
 * @return {Promise<Kunlun>} The deploy promise
 */
function deploy(settings){
   // *Getting the core model initializer:
   const CoreModelSynchronizer = require('./repository/model/synchronizer/core-model-synchronizer');

   // *Connecting and synchronizing the core database:
   return connections.registerAndConnectAndSync(
      connections.NAMES.DB_ADMIN,
      {
         database: settings.connections.database,
         host:     settings.connections.host,
         port:     settings.connections.port,
         user:     settings.connections.roles.db_admin.username,
         pass:     settings.connections.roles.db_admin.password
      },
      new CoreModelSynchronizer())

      // TODO connect and synchronize to all applications' sub databases
      .then(core_conn => {
         // *Building and returnig the Kunlun service instance:
         return new Kunlun(settings);
      });
}



/**
 * Releases all connections to database
 * @return {Promise} The undeploy promise
 */
function undeploy(){
   // *Releasing all the connections:
   return connections.disconnectAll();
}



// *Exporting this module:
module.exports = { deploy, undeploy };
