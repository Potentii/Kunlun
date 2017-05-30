// *Getting the needed modules:
const { expect } = require('chai');
const auth = require('./auth-service');
const OperationError = require('../libs/operations/operation-error');



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


   require('./admins');
   require('./applications');
   require('./credentials');

});
