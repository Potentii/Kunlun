// *Getting the Schema class:
const { Schema } = require('mongoose');
// *Getting the schemas names:
const { COLLECTIONS } = require('../meta');
// *Getting the common regex:
const COMMON_REGEX = require('../../../tools/common-regex');



// *Exporting this module as a function:
module.exports = () => {



   const Credential = new Schema({
      /**
       * The username in plain text
       */
      username: {
         type: String,
         required: true,
         unique: true,
         minlength: [1, 'The username must have at least 1 character']
      },

      /**
       * A salted and hashed version of the actual password (hex encoded)
       */
      password: {
         type: String,
         required: true
      },

      /**
       * The password hash salt
       */
      salt: {
         type: String,
         required: true,
         match: [COMMON_REGEX.UUIDV4, 'Invalid salt. It must be an UUID-V4 string.']
      },

      /**
       * The number of iterations the PBKDF2 needs to execute to produce the password hash
       */
      it: {
         type: Number,
         required: true,
         min: [1, 'The number of iteration must be at least 1']
      },

      /**
       * The hashed client key (hex encoded)
       */
      client_key: {
         type: String,
         required: true
      },

      /**
       * The actual server secret in plain text
       */
      server_secret: {
         type: String,
         required: true,
         match: [COMMON_REGEX.UUIDV4, 'Invalid server secret. It must be an UUID-V4 string.']
      },

      _application: {
         type: Schema.Types.ObjectId,
         ref: COLLECTIONS.APPLICATION,
         required: true
      },

      date: {
         type: Date,
         required: true,
         default: Date.now
      }

   });



   // *Exporting the schema:
   return Credential;
};
