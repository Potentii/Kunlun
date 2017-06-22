// *Getting the needed modules:
const uuid = require('uuid');
const { expect } = require('chai');
const auth = require('../tools/auth-service');
const KunlunError = require('../../libs/errors/kunlun');



describe('Application', function(){

   const applications_to_be_removed = [];


   after('Removing created applications', function(){
      const tasks = [];
      for(application_name of applications_to_be_removed){
         tasks.push(auth.get().applications.remove(undefined, application_name));
      }
      return Promise.all(tasks);
   });


   it('Registers a valid application', function(){
      // *Generating a random name:
      const name = uuid.v4();

      // *Adding a valid application:
      return auth.get().applications.add(undefined, name)
         .then(result => {
            // *Adding to the list of applications to be removed:
            applications_to_be_removed.push(name);
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
         .then(() => Promise.reject(new Error()))
         .catch(err => {
            expect(err).to.be.instanceof(KunlunError);
            expect(err.code).to.be.equal('EAPPLICATION.NAME.MISSING');
         });
      });


      it('Fails if the name already exists', function(){
         // *Generating a random name:
         const name = uuid.v4();

         // *Adding a valid application:
         return auth.get().applications.add(undefined, name)
            .then(result => {
               // *Adding to the list of applications to be removed:
               applications_to_be_removed.push(name);
               // *Trying to add the application again:
               return auth.get().applications.add(undefined, name)
                  // *Throwing an error, as this operation should not have been successful:
                  .then(() => Promise.reject(new Error()))
                  .catch(err => {
                     expect(err).to.be.instanceof(KunlunError);
                     expect(err.code).to.be.equal('EAPPLICATION.NAME.EXISTS');
                  });
            });
      });

   });


   it('Removes an application by its name', function(){
      // *Generating a random name:
      const name = uuid.v4();

      // *Adding a valid application:
      return auth.get().applications.add(undefined, name)
         .then(result => auth.get().applications.remove(undefined, name));
         // TODO check if the database is being removed as well
   });

});
