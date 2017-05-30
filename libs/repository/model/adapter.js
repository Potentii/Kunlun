


/**
 * Syncs the model definition with the database
 * @param  {Mongoose} mongoose The mongoose module
 */
function apply(mongoose){
   // *Getting the collection names:
   const { COLLECTIONS } = require('./meta');

   // *Getting the Schema class:
   const Schema = mongoose.Schema;

   // *Applying the schemas:
   mongoose.model(COLLECTIONS.APPLICATION, require('./collections/application')(Schema));
   mongoose.model(COLLECTIONS.CREDENTIAL,  require('./collections/credential')(Schema));
   mongoose.model(COLLECTIONS.CHALLENGE,   require('./collections/challenge')(Schema));
   mongoose.model(COLLECTIONS.ACCESS,      require('./collections/access')(Schema));
   mongoose.model(COLLECTIONS.ADMIN,       require('./collections/admin')(Schema));
}



// *Exporting this module:
module.exports = { apply };
