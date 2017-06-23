// *Requiring the needed modules:
const { KUNLUN_ERR_CODES } = require('./errors/codes');



/**
 * The Kunlun service API entry point
 * @class
 */
class Kunlun {
   
   constructor(settings){
      // *Setting the configurations:
      this._settings = Object.freeze(settings);

      // *Building the operations map:
      this._operations = Object.freeze({
         admins:       require('./operations/admins')(this, this._settings.admins),
         applications: require('./operations/applications')(this, this._settings.applications),
         credentials:  require('./operations/credentials')(this, this._settings.credentials),
         challenges:   require('./operations/challenges')(this, this._settings.challenges)/*,
         accesses:     require('./operations/accesses')(this, this._settings.accesses)*/
      });

      // *Building the errors object:
      this._errors = Object.freeze({
         KUNLUN_ERR_CODES
      });

      // *Building the types map:
      this._types = Object.freeze({
         Kunlun,
         KunlunError: require('./errors/kunlun')
      });
   }



   get admins(){
      return this._operations.admins;
   }

   get applications(){
      return this._operations.applications;
   }

   get credentials(){
      return this._operations.credentials;
   }

   get challenges(){
      return this._operations.challenges;
   }

   get accesses(){
      return this._operations.accesses;
   }

   get settings(){
      return this._settings;
   }

   get errors(){
      return this._errors;
   }

   get types(){
      return this._types;
   }

}



// *Exporting this class:
module.exports = Kunlun;
