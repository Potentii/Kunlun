// *Getting the needed modules:
const uuid = require('uuid');
const { expect } = require('chai');
const auth = require('./auth-service');
const OperationError = require('../libs/operations/operation-error');



describe('Admin', function(){
   const SIMPLE_PASSWORD = 'abc';


   it('Registers a valid admin', function(){
      // *Generating a random username:
      const username = uuid.v4();
      // *Setting a default password:
      const password = SIMPLE_PASSWORD;

      // *Adding a valid admin:
      return auth.get().admins.add(undefined, username, password)
         .then(result => {
            // *Expecting the result to have an id:
            expect(result).to.have.property('id');
         });
   });


   describe('Username validation', function(){

      it('Fails if no username is supplied', function(){
         // *Setting the username as undefined:
         const username = undefined;
         // *Setting a default password:
         const password = SIMPLE_PASSWORD;

         // *Adding an admin without username:
         return auth.get().admins.add(undefined, username, password)
         // *Throwing an error, as this operation should not have been successful:
         .then(() => new Error())
         .catch(err => {
            expect(err).to.be.instanceof(OperationError);
            expect(err.code).to.be.equal('EUSERNAME.MISSING');

         });
      });


      it('Fails if the username already exists', function(){
         // *Generating a random username:
         const username = uuid.v4();
         // *Setting a default password:
         const password = SIMPLE_PASSWORD;

         // *Adding a valid admin:
         return auth.get().admins.add(undefined, username, password)
            .then(result => {
               return auth.get().admins.add(undefined, username, password)
                  // *Throwing an error, as this operation should not have been successful:
                  .then(() => new Error())
                  .catch(err => {
                     expect(err).to.be.instanceof(OperationError);
                     expect(err.code).to.be.equal('EUSERNAME.EXISTS');
                  });
            });
      });

   });


   describe('Password validation', function(){

      it('Fails if no password is supplied', function(){
         // *Generating a random username:
         const username = uuid.v4();
         // *Setting the password as undefined:
         const password = undefined;

         // *Adding an admin without password:
         return auth.get().admins.add(undefined, username, password)
         // *Throwing an error, as this operation should not have been successful:
         .then(() => new Error())
         .catch(err => {
            expect(err).to.be.instanceof(OperationError);
            expect(err.code).to.be.equal('EPASSWORD.MISSING');
         });
      });

   });

});
