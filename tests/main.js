const { expect } = require('chai');
let auth;
const OperationError = require('../libs/operations/operation-error');
const uuid = require('uuid');



describe('Credentials', function(){
   const SIMPLE_PASSWORD = 'abc';
   // TODO unmock this application instance:
   let application = {
      _id: require('mongoose').Types.ObjectId()
   };


   before('Starting services', function(){
      return require('..')
         .deploy({
            user: '',
            pass: '',
            database: 'auth_schema'
         })
         .then(auth_service => auth = auth_service);
   });


   after('Finishing services', function(){
      return require('..')
         .undeploy();
   });


   it('Registers a valid credential', function(){
      // *Generating a random username:
      const username = uuid.v4();
      const password = SIMPLE_PASSWORD;

      // *Adding a valid credential:
      return auth.credentials.add(application, username, password)
         .then(result => {
            expect(result).to.have.property('id');
         });
   });


   describe('Username validation', function(){

      it('Fails if the username already exists', function(){
         // *Generating a random username:
         const username = uuid.v4();
         const password = SIMPLE_PASSWORD;

         // *Adding a valid credential:
         return auth.credentials.add(application, username, password)
            .then(result => {
               return auth.credentials.add(application, username, password)
                  // *Throwing an error, as it should not have been successful:
                  .then(() => new Error())
                  .catch(err => {
                     expect(err).to.be.instanceof(OperationError);
                     expect(err.code).to.be.equal('EUSERNAME.EXISTS');
                  });
            });
      });


      it.skip('Fails if the username is shorter than the configured min length', function(){
      });


      it.skip('Fails if the username is longer than the configured max length', function(){
      });


      it.skip('Fails if the username doesn\'t match the configured regex', function(){
      });

   });


   describe('Password validation', function(){

      it.skip('Fails if no password is supplied', function(){
      });


      it.skip('Fails if the password is shorter than the configured min length', function(){
      });


      it.skip('Fails if the password is longer than the configured max length', function(){
      });


      it.skip('Fails if the password doesn\'t match the configured regex', function(){
      });

   });

});
