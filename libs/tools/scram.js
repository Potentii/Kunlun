const uuid = require('uuid');
const crypto = require('crypto');
const xor = require('buffer-xor');
const cry = require('./cry');



class ServerSignatureGenerator {

   constructor(server_secret, hashed_password, auth_message) {
      this._server_secret = server_secret;
      this._hashed_password = hashed_password;
      this._auth_message = auth_message;
   }



   generate(){
      return new Promise((resolve, reject) => {
         // *Calculating the server key:
         const server_key = cry.hmacSync('sha256', new Buffer(this._server_secret, 'utf8'), new Buffer(this._hashed_password, 'hex'));
         // *Generating the server signature:
         const server_signature = cry.hmacSync('sha256', this._auth_message, server_key);
         // *Resolving into the server signature:
         resolve(server_signature);
      });
   }

}



function generateChallengeable(password, client_secret){
   // *Returning the promise:
   return new Promise((resolve, reject) => {
      // *Generating the password hash salt:
      const salt = uuid.v4();

      // *Setting the iteration count for the key stretching function:
      const it = 4096;

      // *Hashing the password using the generated salt:
      const hashed_password = cry.pbkdf2Sync('sha256', 256, new Buffer(password, 'utf8'), new Buffer(salt, 'utf8'), it);

      // *Computing the client key and its hashed version:
      const client_key = cry.hmacSync('sha256', new Buffer(client_secret, 'utf8'), hashed_password);
      // *Getting the hashed version of the client key to be stored:
      const hashed_client_key = cry.hashSync('sha256', client_key);

      // *Generating a random server secret:
      const server_secret = uuid.v4();
      // *Computing the server key:
      const server_key = cry.hmacSync('sha256', new Buffer(server_secret, 'utf8'), hashed_password);

      // *Resolving into an challengeable:
      resolve({
         hashed_password,
         salt,
         it,
         hashed_client_key,
         server_secret
      });
   });
}



function combineNonces(client_nonce, server_nonce){
   return client_nonce + server_nonce;
}



function validateClientProof(client_proof_base64, username, hashed_password, salt, it, client_key, client_nonce, server_secret, server_nonce){
   return new Promise((resolve, reject) => {
      // *Getting the client proof as a buffer:
      const client_proof = new Buffer(client_proof_base64, 'base64');
      // *Getting the stored hashed client key as a buffer:
      const hashed_client_key = new Buffer(client_key, 'hex');
      // *Generating the combined nonce:
      const combined_nonce = client_nonce + server_nonce;
      // *Generating the auth message as a buffer:
      const auth_message = new Buffer(`n=${username},r=${client_nonce},r=${combined_nonce},s=${salt},i=${it},k=${server_secret},c=${new Buffer('n,,').toString('base64')},r=${combined_nonce}`, 'utf8');
      // *Calculating the expected client signature:
      const calc_client_signature = cry.hmacSync('sha256', auth_message, hashed_client_key);
      // *Calculating the expected hashed version of the client key:
      const calc_hashed_client_key = cry.hashSync('sha256', xor(calc_client_signature, client_proof));

      // *Declaring the signature generator:
      let server_signature_generator = null;
      // *Checking if the client is able to be authenticated, by comparing the stored hashed client key with the calculated one:
      if(crypto.timingSafeEqual(hashed_client_key, calc_hashed_client_key))
         // *If it is:
         // *Initializing the server signature generator:
         server_signature_generator = new ServerSignatureGenerator(server_secret, hashed_password, auth_message);

      // *Resolving into the signature generator, or null if the authentication has failed:
      resolve(server_signature_generator);
   });
}



// *Exporting this module:
module.exports = {
   combineNonces,
   generateChallengeable,
   validateClientProof
};
