// *Getting the needed modules:
const uuid = require('uuid');
const { expect } = require('chai');
const auth = require('./auth-service');
const OperationError = require('../libs/operations/operation-error');
const { COLLECTIONS } = require('../libs/repository/model/meta');



describe('Application', function(){


   it('Registers a valid application', function(){
      // *Generating a random name:
      const name = uuid.v4();

      // *Adding a valid application:
      return auth.get().applications.add(undefined, name)
         .then(result => {
            // *Requiring the Application model:
            const Application = require('mongoose').model(COLLECTIONS.APPLICATION);
            // *Expecting the result to be an Application object:
            expect(result).to.be.instanceof(Application);
         });
   });


   describe('Name validation', function(){

      it('Fails if no name is supplied', function(){
         // *Setting the name as undefined:
         const name = undefined;

         // *Adding an application without name:
         return auth.get().applications.add(undefined, name)
         // *Throwing an error, as this operation should not have been successful:
         .then(() => new Error())
         .catch(err => {
            expect(err).to.be.instanceof(OperationError);
            expect(err.code).to.be.equal('ENAME.MISSING');

         });
      });


      it('Fails if the name already exists', function(){
         // *Generating a random name:
         const name = uuid.v4();

         // *Adding a valid application:
         return auth.get().applications.add(undefined, name)
            .then(result => {
               return auth.get().applications.add(undefined, name)
                  // *Throwing an error, as this operation should not have been successful:
                  .then(() => new Error())
                  .catch(err => {
                     expect(err).to.be.instanceof(OperationError);
                     expect(err.code).to.be.equal('ENAME.EXISTS');
                  });
            });
      });

   });

});
