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
         required: true
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
