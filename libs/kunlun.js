/**
 * The Kunlun service itself
 * @class
 */
class Kunlun {
   constructor(settings){
      this._settings = Object.freeze(settings);

      this._operations = Object.freeze({
         admins:       require('./operations/admins')(this, this._settings.admins),
         applications: require('./operations/applications')(this, this._settings.applications),
         credentials:  require('./operations/credentials')(this, this._settings.credentials),
         challenges:   require('./operations/challenges')(this, this._settings.challenges)/*,
         accesses:     require('./operations/accesses')(this, this._settings.accesses)*/
      });

      const { KUNLUN_ERR_CODES } = require('./errors/codes');

      this._errors = Object.freeze({
         KUNLUN_ERR_CODES
      });

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


module.exports = Kunlun;
