// *Getting the schemas names:
const { COLLECTIONS } = require('../meta');



// *Exporting this module as a function:
module.exports = Schema => {



   const Access = new Schema({
      token: {
         type: String,
         required: true,
         match: [/^[\w\d]{8}\-[\w\d]{4}\-[\w\d]{4}\-[\w\d]{4}\-[\w\d]{12}$/i, 'Invalid access token. It must be an UUID-V4 string.']
      },

      _credential: {
         type: Schema.Types.ObjectId,
         ref: COLLECTIONS.CREDENTIAL,
         required: true
      },

      _challenge: {
         type: Schema.Types.ObjectId,
         ref: COLLECTIONS.CHALLENGE,
         required: true
      },

      date: {
         type: Date,
         required: true,
         default: Date.now
      }
   });



   // *Exporting the schema:
   return Access;
};
