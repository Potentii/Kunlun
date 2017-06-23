
/**
 * Base model synchronizer
 * @abstract
 * @class
 */
class ModelSynchronizer{
   constructor(){}



   /**
    * Syncs (i.e. "creates if necessary") the database model, given a connection object
    *  It should be implemented for each different model
    * @abstract
    * @param  {Object} conn The connection object
    */
   sync(conn){}
}



// *Exporting this class:
module.exports = ModelSynchronizer;
