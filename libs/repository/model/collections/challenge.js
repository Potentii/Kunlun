// *Getting the schemas names:
const { COLLECTIONS } = require('../meta');



// *Exporting this module as a function:
module.exports = Schema => {



   const Challenge = new Schema({
      salt: {
         type: String,
         required: true,
         match: [/^[\w\d]{8}\-[\w\d]{4}\-[\w\d]{4}\-[\w\d]{4}\-[\w\d]{12}$/i, 'Invalid salt. It must be an UUID-V4 string.']
      },

      _credential: {
         type: Schema.Types.ObjectId,
         ref: COLLECTIONS.CREDENTIAL,
         required: true
      },

      date: {
         type: Date,
         required: true,
         default: Date.now
      }
   });



   // *Exporting the schema:
   return Challenge;
};
