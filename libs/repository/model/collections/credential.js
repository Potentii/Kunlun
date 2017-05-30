// *Getting the schemas names:
const { COLLECTIONS } = require('../meta');



// *Exporting this module as a function:
module.exports = Schema => {



   const Credential = new Schema({
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
