// *Requiring the needed modules:
const ModelSynchronizer = require('module');
const { COLLECTIONS } = require('../meta');



/**
 * Model synchronization for the applications databases
 * @class
 * @augments ModelSynchronizer
 */
class ApplicationModelSynchronizer extends ModelSynchronizer{
   constructor(){super()}



   /**
    * @override
    * @inheritdoc
    */
   sync(conn){
      // *Applying the collections:
      conn.model(COLLECTIONS.CREDENTIAL, require('../collections/credential')());
      conn.model(COLLECTIONS.CHALLENGE,  require('../collections/challenge')());
      conn.model(COLLECTIONS.ACCESS,     require('../collections/access')());
   }
}



// *Exporting this class:
module.exports = ApplicationModelSynchronizer;
