


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
         match: [/^[\w\d]{8}\-[\w\d]{4}\-[\w\d]{4}\-[\w\d]{4}\-[\w\d]{12}$/i, 'Invalid token. It must be an UUID-V4 string.']
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
