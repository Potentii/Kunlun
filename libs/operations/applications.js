// *Requiring the needed modules:
const uuid = require('uuid');
const cry = require('../tools/cry');
const OperationError = require('../operations/operation-error');
const { COLLECTIONS } = require('../repository/model/meta');



module.exports = mongoose => {
   // *Getting the collections models:
   const Application = mongoose.model(COLLECTIONS.APPLICATION);



   /**
    * Creates a new client application in the database
    * @param {Admin} admin The admin user that is attempting to create the new application
    * @param {String} name The new application name
    */
   function add(admin, name){

      // TODO create an '_admin' field in Application collection, so the admin creator can be referenced
      // TODO or just create a separated logging collection for that

      // *Generating the token:
      const token = uuid.v4();

      // *Generating the token hash salt:
      const salt = uuid.v4();

      // *Hashing the token using the generated salt:
      const hashed_token = cry.hash('utf8', 'hex', 'sha256', salt + token);

      // *Adding a new client application:
      return new Application({ name, token: hashed_token, salt })
         .save()
         .then(application_created => {
            return { id: application_created._id, token };
         })
         .catch(err => {
            // *Checking if the error has been thrown by the database:
            if(err.name === 'MongoError'){
               // *If it has:
               // *Checking the error code:
               switch(err.code){
                  // *If the name already exists:
                  case 11000: throw new OperationError('ENAME.EXISTS');
               }
            }

            // *Checking if it is a validation error:
            if(err.name === 'ValidationError'){
               // *If it has:
               // *Checking the error kinds for name:
               if(err.errors.name.kind === 'required')
                  throw new OperationError('ENAME.MISSING');
            }

            // *Throwing the error again, as it wasn't expected:
            throw err;
         });
   }



   // *Returning the routes:
   return { add };
};
