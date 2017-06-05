// *Getting the schemas names:
const { COLLECTIONS } = require('../meta');
// *Getting the common regex:
const COMMON_REGEX = require('../../../tools/common-regex');



// *Exporting this module as a function:
module.exports = Schema => {



   const Access = new Schema({
      token: {
         type: String,
         required: true,
         match: [COMMON_REGEX.UUIDV4, 'Invalid access token. It must be an UUID-V4 string.']
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
