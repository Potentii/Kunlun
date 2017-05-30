// *Requiring the needed modules:
const crypto = require('crypto');



/**
 * Encrypts a message with a given secret key
 * @param  {string} message_encoding The input message encoding (e.g. utf8, ascii, latin1)
 * @param  {string} encryption_type  The encryption output type (e.g. hex, base64, latin1)
 * @param  {string} algorithm        The encryption algorithm to be used (e.g aes192)
 * @param  {string} message          The input message to be encrypted
 * @param  {string} secret           The encryption secret key
 * @return {string}                  The encrypted digest
 */
function encrypt(message_encoding, encryption_type, algorithm, message, secret){
   const cipher = crypto.createCipher(algorithm, secret);
   let encrypted = cipher.update(message, message_encoding, encryption_type);
   encrypted += cipher.final(encryption_type);
   return encrypted;
}



/**
 * Decrypts a message using a given secret key
 * @param  {string} message_encoding The output message encoding (e.g. utf8, ascii, latin1)
 * @param  {string} encryption_type  The encrypted input type (e.g. hex, base64, latin1)
 * @param  {string} algorithm        The decryption algorithm to be used (e.g aes192)
 * @param  {string} encrypted        The input digest to be decrypted
 * @param  {string} secret           The decryption secret key
 * @return {string}                  The decrypted message
 */
function decrypt(message_encoding, encryption_type, algorithm, encrypted, secret){
   const decipher = crypto.createDecipher(algorithm, secret);
   let message = decipher.update(encrypted, encryption_type, message_encoding);
   message += decipher.final(message_encoding);
   return message;
}



/**
 * Hashes a message
 * @param  {string} message_encoding The input message encoding (e.g. utf8, ascii, latin1)
 * @param  {string} hash_type        The hash output type (e.g. hex, base64, latin1)
 * @param  {string} algorithm        The hash algorithm to be used (e.g sha256)
 * @param  {string} message          The input message to be hashed
 * @return {string}                  The hashed digest
 */
function hash(message_encoding, hash_type, algorithm, message){
   const hash = crypto.createHash(algorithm);
   hash.update(message, message_encoding);
   return hash.digest(hash_type);
}



// *Exporting this module:
module.exports = { encrypt, decrypt, hash };
