const database = require('./repository/database');



function deploy(database_options, username_options, password_options){
   const settings = {
      username: username_options,
      password: password_options
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
         credentials: require('./operations/credentials')(mongoose, settings)
      };
   });
}



function undeploy(){
   return database.disconnect();
}


module.exports = { deploy, undeploy };
