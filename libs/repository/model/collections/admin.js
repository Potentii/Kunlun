// *Getting the schemas names:
const { COLLECTIONS } = require('../meta');



// *Exporting this module as a function:
module.exports = Schema => {



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
         match: [/^[a-f0-9]{8}\-[a-f0-9]{4}\-4[a-f0-9]{3}\-[a-f0-9]{4}\-[a-f0-9]{12}$/i, 'Invalid salt. It must be an UUID-V4 string.']
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
