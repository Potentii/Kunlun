// *Getting the needed modules:
const auth = require('./tools/auth-service');



describe('operations', function(){

   before('Starting services', function(){
      return require('..')
         .deploy({
            user: '',
            pass: '',
            database: 'auth_schema'
         }, {
            credentials_username_min_length: 4,
            credentials_username_max_length: 36,
            credentials_password_min_length: 2,
            credentials_password_max_length: 16
         })
         .then(auth_service => auth.set(auth_service));
   });


   after('Finishing services', function(){
      return require('..')
         .undeploy();
   });


   require('./operations/admins');
   require('./operations/applications');
   require('./operations/credentials');
   require('./operations/challenges');
});
