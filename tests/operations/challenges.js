// *Getting the needed modules:
const uuid = require('uuid');
const crypto = require('crypto');
const xor = require('buffer-xor');
const { expect } = require('chai');
const cry = require('../../libs/tools/cry');
const auth = require('../tools/auth-service');
const OperationError = require('../../libs/tools/operation-error');



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


   it('SCRAM', function(){
      const client_nonce = uuid.v4();
      let hashed_password;
      let server_secret;
      let auth_message;

      // *Starting a new challenge:
      return auth.get().challenges.generateNew(username, client_nonce)
         .then(result => {
            // *Expecting the result to have an id:
            expect(result).to.have.property('id');
            expect(result).to.have.property('salt');
            expect(result).to.have.property('it');
            expect(result).to.have.property('server_secret');
            expect(result).to.have.property('combined_nonce');
            return result;
         })
         .then(result => {
            server_secret = result.server_secret;
            hashed_password = cry.pbkdf2Sync('sha256', 256, new Buffer(password, 'utf8'), new Buffer(result.salt, 'utf8'), result.it);
            const client_key = cry.hmacSync('sha256', new Buffer(client_secret, 'utf8'), hashed_password);
            const hashed_client_key = cry.hashSync('sha256', client_key);

            auth_message = `n=${username},r=${client_nonce},r=${result.combined_nonce},s=${result.salt},i=${result.it},k=${result.server_secret},c=${new Buffer('n,,').toString('base64')},r=${result.combined_nonce}`;

            const client_signature = cry.hmacSync('sha256', new Buffer(auth_message, 'utf8'), hashed_client_key);
            const client_proof = xor(client_key, client_signature);

            return auth.get().challenges.checkAnswer(result.id, client_proof.toString('base64'));
         })
         .then(result => {
            expect(result).to.have.property('token');
            expect(result).to.have.property('server_signature');
            return result;
         })
         .then(result => {
            const server_key = cry.hmacSync('sha256', new Buffer(server_secret, 'utf8'), hashed_password);
            const calc_server_signature = cry.hmacSync('sha256', new Buffer(auth_message, 'utf8'), server_key);
            const server_authenticated = crypto.timingSafeEqual(result.server_signature, calc_server_signature);
            expect(server_authenticated).to.be.true;
         });
   });

});
