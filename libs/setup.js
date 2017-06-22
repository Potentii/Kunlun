// *Requiring the needed modules:
const conns = require('./repository/connections');
const Kunlun = require('./kunlun');

// TODO remove unused conn names
// TODO remove applications after the tests
// TODO conn.getFromApplication(application_name);
//      or conn.get(conn.NAMES.fromApplication(application_name));


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
         const { COLLECTIONS } = require('./repository/model/meta');
         // *Getting the collections models:
         const Application = conns.get(conns.NAMES.READ_WRITE).model(COLLECTIONS.APPLICATION);

         return Application
            .find()
            .exec()
      })

      .then(applications_found => {
         const apps_connection_tasks = [];

         for(let application of applications_found){
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
