// *Getting the Schema class:
const { Schema } = require('mongoose');
// *Getting the common regex:
const COMMON_REGEX = require('../../../tools/common-regex');



// *Exporting this module as a function:
module.exports = () => {



   const Application = new Schema({
      /**
       * The application name in plain text
       */
      name: {
         type: String,
         required: true,
         unique: true,
         match: [/^[a-zA-Z0-9\_\-]+$/, 'Invalid application name']
      },

      /**
       * A salted and hashed version of the generated token (hex encoded)
       */
      token: {
         type: String,
         required: true
      },

      /**
       * The token hash salt
       */
      salt: {
         type: String,
         required: true,
         match: [COMMON_REGEX.UUIDV4, 'Invalid salt. It must be an UUID-V4 string.']
      },

      /**
       * The database name this application will store its users info
       */
      database: {
         type: String,
         unique: true,
         required: true
      },

      date: {
         type: Date,
         required: true,
         default: Date.now
      }
   });



   // *Exporting the schema:
   return Application;
};
