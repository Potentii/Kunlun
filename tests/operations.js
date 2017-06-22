// *Getting the needed modules:
const auth = require('./tools/auth-service');



describe('operations', function(){

   before('Starting services', function(){
      // *Increasing the timeout for this task:
      this.timeout(10000);

      // *Deploying the Kunlun service:
      return require('..')
         .deploy({
            credentials: {
               username: {
                  min_length: 4,
                  max_length: 36
               },
               password: {
                  min_length: 2,
                  max_length: 16
               }
            },
            connections: {
               host: '127.0.0.1',
               port: '27017',
               database: process.env.CONN_ROOT_DATABASE,
               roles: {
                  user_admin: {
                     username: process.env.CONN_USER_ADMIN_USERNAME,
                     password: process.env.CONN_USER_ADMIN_PASSWORD
                  },
                  db_admin: {
                     username: process.env.CONN_DB_ADMIN_USERNAME,
                     password: process.env.CONN_DB_ADMIN_PASSWORD
                  },
                  read: {
                     username: process.env.CONN_READ_USERNAME,
                     password: process.env.CONN_READ_PASSWORD
                  },
                  read_write: {
                     username: process.env.CONN_READ_WRITE_USERNAME,
                     password: process.env.CONN_READ_WRITE_PASSWORD
                  }
               }
            }
         })

         // *Storing the kunlun service instance inside a cache, so it can be tested through multiple scripts:
         .then(auth_service => auth.set(auth_service));
   });


   after('Finishing services', function(){
      // *Undeploying Kunlun (i.e. releasing all of its connections, and so on)
      return require('..')
         .undeploy();
   });


   // *Running all the operations test suits:
   require('./operations/admins');
   require('./operations/applications');
   require('./operations/credentials');
   require('./operations/challenges');
});
