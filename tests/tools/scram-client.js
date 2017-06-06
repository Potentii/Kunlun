const crypto = require('crypto');
const xor = require('buffer-xor');
const cry = require('../../libs/tools/cry');

class SCRAMClient {
   constructor(username, password, client_nonce, client_secret) {
      this._username = username;
      this._password = password;
      this._client_nonce = client_nonce;
      this._client_secret = client_secret;
      this._hashed_password = null;
      this._server_secret = null;
      this._auth_message = null;
   }



   handleServerFirstmessage(challenge_id, combined_nonce, salt, it, server_secret){
      this._server_secret = server_secret;
      this._hashed_password = cry.pbkdf2Sync('sha256', 256, new Buffer(this._password, 'utf8'), new Buffer(salt, 'utf8'), it);
      this._password = null;
      const client_key = cry.hmacSync('sha256', new Buffer(this._client_secret, 'utf8'), this._hashed_password);
      const hashed_client_key = cry.hashSync('sha256', client_key);

      this._auth_message = new Buffer(`n=${this._username},r=${this._client_nonce},r=${combined_nonce},s=${salt},i=${it},k=${this._server_secret},c=${new Buffer('n,,').toString('base64')},r=${combined_nonce}`, 'utf8');

      const client_signature = cry.hmacSync('sha256', this._auth_message, hashed_client_key);
      const client_proof = xor(client_key, client_signature);

      return {
         id: challenge_id,
         client_proof: client_proof.toString('base64')
      };
   }



   isServerAuthenticated(server_signature){
      const server_key = cry.hmacSync('sha256', new Buffer(this._server_secret, 'utf8'), this._hashed_password);
      const calc_server_signature = cry.hmacSync('sha256', this._auth_message, server_key);
      return crypto.timingSafeEqual(server_signature, calc_server_signature);
   }

}


module.exports = SCRAMClient;
