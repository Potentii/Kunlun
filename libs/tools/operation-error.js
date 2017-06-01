/**
 * Represents a business logic failure
 */
class OperationError extends Error{

   constructor(code, message){
      super(message);
      this._code = code;
   }

   get code(){
      return this._code;
   }
}



// *Exporting this class:
module.exports = OperationError;
