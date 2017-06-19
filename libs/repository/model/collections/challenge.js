// *Getting the schemas names:
const { COLLECTIONS } = require('../meta');
// *Getting the common regex:
const COMMON_REGEX = require('../../../tools/common-regex');
// *Getting the Schema class:
const { Schema } = require('mongoose');



// *Exporting this module as a function:
module.exports = () => {



   const Challenge = new Schema({
      client_nonce: {
         type: String,
         required: true
      },

      server_nonce: {
         type: String,
         required: true,
         match: [COMMON_REGEX.UUIDV4, 'Invalid server nonce. It must be an UUID-V4 string.']
      },

      answered: {
         type: Boolean,
         required: true,
         default: false
      },

      _credential: {
         type: Schema.Types.ObjectId,
         ref: COLLECTIONS.CREDENTIAL,
         required: true
      },

      // TODO add a expiration date and/or an attempt counter

      date: {
         type: Date,
         required: true,
         default: Date.now
      }
   });



   // *Exporting the schema:
   return Challenge;
};
