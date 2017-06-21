// *Requiring the needed modules:
const conns = require('./repository/connections');
const Kunlun = require('./kunlun');



/**
 * Sets up and deploy the Kunlun service
 * @param  {Object} settings The kunlun settings object
 * @return {Promise<Kunlun>} The deploy promise
 */
function deploy(settings){
   // *Getting the core model initializer:
   const CoreModelSynchronizer = require('./repository/model/synchronizer/core-model-synchronizer');

   // *Connecting and synchronizing the core database connections:
   return Promise.all([
         conns.registerAndConnect(
            conns.NAMES.USER_ADMIN,
            {
               database: 'admin',
               host:     settings.connections.host,
               port:     settings.connections.port,
               user:     settings.connections.roles.user_admin.username,
               pass:     settings.connections.roles.user_admin.password
            }),

         conns.registerAndConnectAndSync(
            conns.NAMES.READ_WRITE,
            {
               database: settings.connections.database,
               host:     settings.connections.host,
               port:     settings.connections.port,
               user:     settings.connections.roles.read_write.username,
               pass:     settings.connections.roles.read_write.password
            },
            new CoreModelSynchronizer())
      ])

      // TODO connect and synchronize to all applications' sub databases
      .then(() => {
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
   return conns.disconnectAll();
}



// *Exporting this module:
module.exports = { deploy, undeploy };
