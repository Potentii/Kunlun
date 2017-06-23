// *Getting the Schema class:
const { Schema } = require('mongoose');
// *Getting the schemas names:
const { COLLECTIONS } = require('../meta');
// *Getting the common regex:
const COMMON_REGEX = require('../../../tools/common-regex');



// *Exporting this module as a function:
module.exports = () => {



   const Admin = new Schema({
      username: {
         type: String,
         required: true,
         unique: true
      },

      password: {
         type: String,
         required: true
      },

      salt: {
         type: String,
         required: true,
         match: [COMMON_REGEX.UUIDV4, 'Invalid salt. It must be an UUID-V4 string.']
      },

      date: {
         type: Date,
         required: true,
         default: Date.now
      }
   });



   // *Exporting the schema:
   return Admin;
};
