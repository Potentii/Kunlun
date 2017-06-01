// *Getting the needed modules:
const uuid = require('uuid');
const { expect } = require('chai');
const auth = require('../tools/auth-service');
const OperationError = require('../../libs/tools/operation-error');



describe('Credentials', function(){
   const SIMPLE_PASSWORD = 'abc';

   // TODO unmock this application instance:
   let application = {
      _id: require('mongoose').Types.ObjectId()
   };


   it('Registers a valid credential', function(){
      // *Generating a random username:
      const username = uuid.v4();
      // *Setting a default password:
      const password = SIMPLE_PASSWORD;

      // *Adding a valid credential:
      return auth.get().credentials.add(application, username, password)
         .then(result => {
            // *Expecting the result to have an id:
            expect(result).to.have.property('id');
         });
   });


   describe('Username validation', function(){

      it('Fails if no username is supplied, or if it\'s not a string', function(){
         // *Setting the username as undefined:
         const username = undefined;
         // *Setting a default password:
         const password = SIMPLE_PASSWORD;

         // *Adding a credential without username:
         return auth.get().credentials.add(application, username, password)
         // *Throwing an error, as this operation should not have been successful:
         .then(() => new Error())
         .catch(err => {
            expect(err).to.be.instanceof(OperationError);
            expect(err.code).to.be.equal('EUSERNAME.TYPE');
         });
      });


      it('Fails if the username already exists', function(){
         // *Generating a random username:
         const username = uuid.v4();
         // *Setting a default password:
         const password = SIMPLE_PASSWORD;

         // *Adding a valid credential:
         return auth.get().credentials.add(application, username, password)
            .then(result => {
               return auth.get().credentials.add(application, username, password)
                  // *Throwing an error, as this operation should not have been successful:
                  .then(() => new Error())
                  .catch(err => {
                     expect(err).to.be.instanceof(OperationError);
                     expect(err.code).to.be.equal('EUSERNAME.EXISTS');
                  });
            });
      });


      it('Fails if the username is shorter than the configured min length', function(){
         // *Setting a default password:
         const password = SIMPLE_PASSWORD;

         // *Building a short username:
         let username = '';
         for(let i=0; i<auth.get().settings.credentials.username.min_length-1; i++){
            username += 'a';
         }

         // *Adding a credential with a short username:
         return auth.get().credentials.add(application, username, password)
         // *Throwing an error, as this operation should not have been successful:
         .then(() => new Error())
         .catch(err => {
            expect(err).to.be.instanceof(OperationError);
            expect(err.code).to.be.equal('EUSERNAME.LENGTH');
         });
      });


      it('Fails if the username is longer than the configured max length', function(){
         // *Setting a default password:
         const password = SIMPLE_PASSWORD;

         // *Building a long username:
         let username = '';
         for(let i=0; i<auth.get().settings.credentials.username.max_length+1; i++){
            username += 'a';
         }

         // *Adding a credential with a long username:
         return auth.get().credentials.add(application, username, password)
         // *Throwing an error, as this operation should not have been successful:
         .then(() => new Error())
         .catch(err => {
            expect(err).to.be.instanceof(OperationError);
            expect(err.code).to.be.equal('EUSERNAME.LENGTH');
         });
      });

   });


   describe('Password validation', function(){

      it('Fails if no password is supplied, or if it\'s not a string', function(){
         // *Generating a random username:
         const username = uuid.v4();
         // *Setting the password as undefined:
         const password = undefined;

         // *Adding a credential without password:
         return auth.get().credentials.add(application, username, password)
         // *Throwing an error, as this operation should not have been successful:
         .then(() => new Error())
         .catch(err => {
            expect(err).to.be.instanceof(OperationError);
            expect(err.code).to.be.equal('EPASSWORD.TYPE');
         });
      });


      it('Fails if the password is shorter than the configured min length', function(){
         // *Generating a random username:
         const username = uuid.v4();

         // *Building a short password:
         let password = '';
         for(let i=0; i<auth.get().settings.credentials.password.min_length-1; i++){
            password += 'a';
         }

         // *Adding a credential with a short password:
         return auth.get().credentials.add(application, username, password)
         // *Throwing an error, as this operation should not have been successful:
         .then(() => new Error())
         .catch(err => {
            expect(err).to.be.instanceof(OperationError);
            expect(err.code).to.be.equal('EPASSWORD.LENGTH');
         });
      });


      it('Fails if the password is longer than the configured max length', function(){
         // *Generating a random username:
         const username = uuid.v4();

         // *Building a long password:
         let password = '';
         for(let i=0; i<auth.get().settings.credentials.password.max_length+1; i++){
            password += 'a';
         }

         // *Adding a credential with a long password:
         return auth.get().credentials.add(application, username, password)
         // *Throwing an error, as this operation should not have been successful:
         .then(() => new Error())
         .catch(err => {
            expect(err).to.be.instanceof(OperationError);
            expect(err.code).to.be.equal('EPASSWORD.LENGTH');
         });
      });

   });

});
