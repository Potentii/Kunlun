// *Requiring the needed modules:
const conns = require('./repository/connections');
const Kunlun = require('./kunlun');



/**
 * Sets up and deploy the Kunlun service
 * @param  {Object} settings The kunlun settings object
 * @return {Promise<Kunlun>} The deploy promise
 */
function deploy(settings){
   // *Getting the models synchronizers:
   const CoreModelSynchronizer = require('./repository/model/synchronizer/core-model-synchronizer');
   const ApplicationModelSynchronizer = require('./repository/model/synchronizer/application-model-synchronizer');

   // *Connecting and synchronizing the core database connections:
   return Promise.all([
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

      .then(() => {
         // *Getting the collections names:
         const { COLLECTIONS } = require('./repository/model/meta');
         // *Getting the collections models:
         const Application = conns.get(conns.NAMES.READ_WRITE).model(COLLECTIONS.APPLICATION);

         // *Retrieving all the applications registered:
         return Application
            .find()
            .exec();
      })

      .then(applications_found => {
         // *Declaring the connection tasks list:
         const apps_connection_tasks = [];

         // *Getting each application:
         for(let application of applications_found){
            // *Connecting and synchronizing on each application's database:
            apps_connection_tasks.push(conns.registerAndConnectAndSync(
               conns.NAMES.fromApplication(application.name),
               {
                  database: application.database,
                  host:     settings.connections.host,
                  port:     settings.connections.port,
                  user:     settings.connections.roles.read_write.username,
                  pass:     settings.connections.roles.read_write.password
               },
               new ApplicationModelSynchronizer()));
         }

         // *Waiting until all the connections have been established:
         return Promise.all(apps_connection_tasks);
      })

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
