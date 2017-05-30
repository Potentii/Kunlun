


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
