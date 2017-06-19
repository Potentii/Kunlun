const database = require('./repository/database');


function deploy(database_options, settings = {}){

   settings = {
      credentials: {
         username: {
            min_length: settings.credentials_username_min_length,
            max_length: settings.credentials_username_max_length
         },
         password: {
            min_length: settings.credentials_password_min_length,
            max_length: settings.credentials_password_max_length
         }
      },
      connection: {
         host: '127.0.0.1',
         port: '27017',
         database: 'kunlun_base',
         roles: {
            user_admin: {
               username: 'abc',
               password: '123'
            },
            db_admin: {
               username: 'abc',
               password: '123'
            },
            read: {
               username: 'abc',
               password: '123'
            },
            read_write: {
               username: 'abc',
               password: '123'
            }
         }
      }
   };

   const module = require('module');

   return database.connectAndSync({
      database: settings.connection.database,
      host:     settings.connection.host,
      port:     settings.connection.port,
      user:     settings.connection.roles.db_admin.username,
      pass:     settings.connection.roles.db_admin.password
   }, )

   return database.connectAndSync({
      host:     database_options.hostname,
      port:     database_options.port,
      user:     database_options.username,
      pass:     database_options.password,
      database: database_options.database
   })
   .then(mongoose => {
      return {
         admins:       require('./operations/admins')(mongoose, settings.admins),
         applications: require('./operations/applications')(mongoose, settings.applications),
         credentials:  require('./operations/credentials')(mongoose, settings.credentials),
         challenges:   require('./operations/challenges')(mongoose, settings.challenges),
         accesses:     require('./operations/accesses')(mongoose, settings.accesses),
         settings,
         errors:       require('./errors/codes'),
         types:        {}
      };
   });
}



function undeploy(){
   return database.disconnect();
}


module.exports = { deploy, undeploy };
