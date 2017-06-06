// *Getting the needed modules:
const uuid = require('uuid');
const { expect } = require('chai');
const auth = require('../tools/auth-service');
const KunlunError = require('../../libs/errors/kunlun');
const SCRAMClient = require('../tools/scram-client');



describe('Challenges', function(){
   const SIMPLE_PASSWORD = 'abc';

   let username;
   let password;
   let client_secret;

   // TODO unmock this application instance:
   let application = {
      _id: require('mongoose').Types.ObjectId()
   };


   before(function(){
      // *Generating a random username:
      username = uuid.v4();
      // *Setting a default password:
      password = SIMPLE_PASSWORD;

      client_secret = uuid.v4();

      // *Adding a valid credential:
      return auth.get().credentials.add(application, username, password, client_secret);
   });


   it('Creates a new access with a valid SCRAM flow', function(){
      // *Generating a random nonce:
      const client_nonce = uuid.v4();
      // *initializing the scram client:
      const scram_client = new SCRAMClient(username, password, client_nonce, client_secret);

      // *Starting a new challenge:
      return auth.get().challenges.generateNew(username, client_nonce)
         .then(result => {
            // *Expecting the result to have the challenge id:
            expect(result).to.have.property('id');
            // *Expecting the result to have the password hash salt:
            expect(result).to.have.property('salt');
            // *Expecting the result to have the password hash iteration count:
            expect(result).to.have.property('it');
            // *Expecting the result to have the server secret:
            expect(result).to.have.property('server_secret');
            // *Expecting the result to have the combined nounce:
            expect(result).to.have.property('combined_nonce');
            // *Appending the result in the promise chain again:
            return result;
         })
         // *Processing the server-first-message, and generating the challenge answer:
         .then(result => scram_client.handleServerFirstmessage(result.id, result.combined_nonce, result.salt, result.it, result.server_secret))
         // *Sending the challenge answer:
         .then(result => auth.get().challenges.checkAnswer(result.id, result.client_proof))
         .then(result => {
            // *Expecting the result to have the generated access token:
            expect(result).to.have.property('token');
            // *Expecting the result to have the calculated server signature:
            expect(result).to.have.property('server_signature');
            // *Appending the result in the promise chain again:
            return result;
         })
         // *Checking if the server is authenticated:
         .then(result => expect(scram_client.isServerAuthenticated(result.server_signature)).to.be.true);
   });


   describe('Creation', function(){

      it('Rejects a challenge creation if an inexistent username is provided', function(){
         // *Creating an inexistent username:
         const inexistent_username = '--inexistent-username--';
         // *Generating a random nonce:
         const client_nonce = uuid.v4();
         // *initializing the scram client:
         const scram_client = new SCRAMClient(inexistent_username, password, client_nonce, client_secret);

         // *Starting a new challenge with an inexistent username:
         return auth.get().challenges.generateNew(inexistent_username, client_nonce)
            // *Throwing an error, as this operation should not have been successful:
            .then(() => Promise.reject(new Error()))
            .catch(err => {
               expect(err).to.be.instanceof(KunlunError);
               expect(err.code).to.be.equal('ECHALLENGE.USERNAME.NOTFOUND');
            });
      });


      it('Rejects a challenge creation if an invalid username is provided', function(){
         // *Creating an invalid username:
         const invalid_username = null;
         // *Generating a random nonce:
         const client_nonce = uuid.v4();
         // *initializing the scram client:
         const scram_client = new SCRAMClient(invalid_username, password, client_nonce, client_secret);

         // *Starting a new challenge with an invalid username:
         return auth.get().challenges.generateNew(invalid_username, client_nonce)
            // *Throwing an error, as this operation should not have been successful:
            .then(() => Promise.reject(new Error()))
            .catch(err => {
               expect(err).to.be.instanceof(KunlunError);
               expect(err.code).to.be.equal('ECHALLENGE.USERNAME.TYPE');
            });
      });


      it('Rejects a challenge creation if an invalid client nonce is provided', function(){
         // *Creating an invalid nonce:
         const invalid_client_nonce = null;
         // *initializing the scram client:
         const scram_client = new SCRAMClient(username, password, invalid_client_nonce, client_secret);

         // *Starting a new challenge with an invalid client nonce:
         return auth.get().challenges.generateNew(username, invalid_client_nonce)
            // *Throwing an error, as this operation should not have been successful:
            .then(() => Promise.reject(new Error()))
            .catch(err => {
               expect(err).to.be.instanceof(KunlunError);
               expect(err.code).to.be.equal('ECHALLENGE.NONCE.TYPE');
            });
      });

   });


   describe('Answering', function(){

      it('Rejects a challenge answer if an inexistent challenge id is provided', function(){
         // *Creating an inexistent challenge id:
         const inexistent_challenge_id = '--inexistent-id--';
         // *Generating a random nonce:
         const client_nonce = uuid.v4();
         // *initializing the scram client:
         const scram_client = new SCRAMClient(username, password, client_nonce, client_secret);

         // *Starting a new challenge:
         return auth.get().challenges.generateNew(username, client_nonce)
            // *Processing the server-first-message, and generating the challenge answer:
            .then(result => scram_client.handleServerFirstmessage(result.id, result.combined_nonce, result.salt, result.it, result.server_secret))
            // *Sending the challenge answer, with an inexistent challenge id:
            .then(result => auth.get().challenges.checkAnswer(inexistent_challenge_id, result.client_proof))
            // *Throwing an error, as this operation should not have been successful:
            .then(() => Promise.reject(new Error()))
            .catch(err => {
               expect(err).to.be.instanceof(KunlunError);
               expect(err.code).to.be.equal('ECHALLENGE.NOTFOUND');
            });
      });


      it('Rejects a challenge answer if an invalid challenge id is provided', function(){
         // *Creating an invalid challenge id:
         const invalid_challenge_id = null;
         // *Generating a random nonce:
         const client_nonce = uuid.v4();
         // *initializing the scram client:
         const scram_client = new SCRAMClient(username, password, client_nonce, client_secret);

         // *Starting a new challenge:
         return auth.get().challenges.generateNew(username, client_nonce)
            // *Processing the server-first-message, and generating the challenge answer:
            .then(result => scram_client.handleServerFirstmessage(result.id, result.combined_nonce, result.salt, result.it, result.server_secret))
            // *Sending the challenge answer, with an invalid challenge id:
            .then(result => auth.get().challenges.checkAnswer(invalid_challenge_id, result.client_proof))
            // *Throwing an error, as this operation should not have been successful:
            .then(() => Promise.reject(new Error()))
            .catch(err => {
               expect(err).to.be.instanceof(KunlunError);
               expect(err.code).to.be.equal('ECHALLENGE.TYPE');
            });
      });


      it('Rejects a challenge answer if an incorrect proof is provided', function(){
         // *Creating an incorrect proof:
         const incorrect_proof = '--incorrect-proof--';
         // *Generating a random nonce:
         const client_nonce = uuid.v4();
         // *initializing the scram client:
         const scram_client = new SCRAMClient(username, password, client_nonce, client_secret);

         // *Starting a new challenge:
         return auth.get().challenges.generateNew(username, client_nonce)
            // *Processing the server-first-message, and generating the challenge answer:
            .then(result => scram_client.handleServerFirstmessage(result.id, result.combined_nonce, result.salt, result.it, result.server_secret))
            // *Sending the challenge answer, with an incorrect proof:
            .then(result => auth.get().challenges.checkAnswer(result.id, incorrect_proof))
            // *Throwing an error, as this operation should not have been successful:
            .then(() => Promise.reject(new Error()))
            .catch(err => {
               expect(err).to.be.instanceof(KunlunError);
               expect(err.code).to.be.equal('ECHALLENGE.PROOF.CHECK');
            });
      });


      it('Does not allow to answer a successful challenge twice', function(){
         // *Generating a random nonce:
         const client_nonce = uuid.v4();
         // *initializing the scram client:
         const scram_client = new SCRAMClient(username, password, client_nonce, client_secret);

         let challenge_id;
         let correct_client_proof;

         // *Starting a new challenge:
         return auth.get().challenges.generateNew(username, client_nonce)
            // *Processing the server-first-message, and generating the challenge answer:
            .then(result => scram_client.handleServerFirstmessage(result.id, result.combined_nonce, result.salt, result.it, result.server_secret))
            .then(result => {
               // *Storing the challenge id:
               challenge_id = result.id;
               // *Storing the correct client proof:
               correct_client_proof = result.client_proof;
               // *Sending the challenge answer:
               return auth.get().challenges.checkAnswer(challenge_id, correct_client_proof);
            })
            // *Sending the challenge answer again:
            .then(() => auth.get().challenges.checkAnswer(challenge_id, correct_client_proof))
            // *Throwing an error, as this operation should not have been successful:
            .then(() => Promise.reject(new Error()))
            .catch(err => {
               expect(err).to.be.instanceof(KunlunError);
               expect(err.code).to.be.equal('ECHALLENGE.NOTFOUND');
            });
      });


      it('Does not allow to answer a rejected challenge twice', function(){
         // *Generating a random nonce:
         const client_nonce = uuid.v4();
         // *initializing the scram client:
         const scram_client = new SCRAMClient(username, password, client_nonce, client_secret);

         let challenge_id;
         let correct_client_proof;

         // *Starting a new challenge:
         return auth.get().challenges.generateNew(username, client_nonce)
            // *Processing the server-first-message, and generating the challenge answer:
            .then(result => scram_client.handleServerFirstmessage(result.id, result.combined_nonce, result.salt, result.it, result.server_secret))
            .then(result => {
               // *Storing the challenge id:
               challenge_id = result.id;
               // *Storing the correct client proof:
               correct_client_proof = result.client_proof;
               // *Sending the challenge answer, with an incorrect proff, so it gets rejected:
               return auth.get().challenges.checkAnswer(challenge_id, 'A' + correct_client_proof);
            })
            // *Sending the challenge answer again, this time with the correct answer:
            .catch(err => auth.get().challenges.checkAnswer(challenge_id, correct_client_proof))
            // *Throwing an error, as this operation should not have been successful:
            .then(() => Promise.reject(new Error()))
            .catch(err => {
               expect(err).to.be.instanceof(KunlunError);
               expect(err.code).to.be.equal('ECHALLENGE.NOTFOUND');
            });
      });

   });

});
