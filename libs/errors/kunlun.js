/**
 * Represents a business logic failure
 */
class KunlunError extends Error{

   constructor(code, message){
      super(message);
      this._name = 'KunlunError';
      this._code = code;
   }

   get name(){
      return this._name;
   }

   get code(){
      return this._code;
   }
}



// *Exporting this class:
module.exports = KunlunError;
