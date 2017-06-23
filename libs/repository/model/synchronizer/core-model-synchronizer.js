// *Requiring the needed modules:
const ModelSynchronizer = require('module');
const { COLLECTIONS } = require('../meta');



/**
 * Model synchronization for the core database
 * @class
 * @augments ModelSynchronizer
 */
class CoreModelSynchronizer extends ModelSynchronizer{
   constructor(){super()}



   /**
    * @override
    * @inheritdoc
    */
   sync(conn){
      // *Applying the collections:
      conn.model(COLLECTIONS.APPLICATION, require('../collections/application')());
      conn.model(COLLECTIONS.ADMIN,       require('../collections/admin')());
   }
}



// *Exporting this class:
module.exports = CoreModelSynchronizer;
