const database = require('./repository/database');


function deploy(database_options, settings){

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
      }
   };

   return database.connectAndSync({
      host:     database_options.hostname,
      port:     database_options.port,
      user:     database_options.username,
      pass:     database_options.password,
      database: database_options.database
   })
   .then(mongoose => {
      return {
         admins: require('./operations/admins')(mongoose, settings),
         credentials: require('./operations/credentials')(mongoose, settings),
         settings
      };
   });
}



function undeploy(){
   return database.disconnect();
}


module.exports = { deploy, undeploy };
