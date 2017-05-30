


// *Exporting this module as a function:
module.exports = Schema => {



   const Application = new Schema({
      name: {
         type: String,
         required: true,
         unique: true,
         match: [/^[a-zA-Z0-9\_\-]+$/, 'Invalid service name']
      },

      token: {
         type: String,
         required: true,
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
   return Application;
};
