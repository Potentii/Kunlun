// *Getting the needed modules:
const uuid = require('uuid');
const { expect } = require('chai');
const auth = require('../tools/auth-service');
const OperationError = require('../../libs/operations/operation-error');



describe('Application', function(){


   it('Registers a valid application', function(){
      // *Generating a random name:
      const name = uuid.v4();

      // *Adding a valid application:
      return auth.get().applications.add(undefined, name)
         .then(result => {
            // *Expecting the result to have an id:
            expect(result).to.have.property('id');
            // *Expecting the result to have the generated token:
            expect(result).to.have.property('token');
            expect(result.token).to.match(/^[a-f0-9]{8}\-[a-f0-9]{4}\-4[a-f0-9]{3}\-[a-f0-9]{4}\-[a-f0-9]{12}$/i);
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
