
/**
 * Defines the operation error codes
 * @readonly
 * @enum
 * @type {object}
 */
const OP_ERR_CODES = Object.freeze({
   ADMIN: {
      CHECK: 'EADMIN.CHECK',
      USERNAME: {
         LENGTH:  'EADMIN.USERNAME.LENGTH',
         MISSING: 'EADMIN.USERNAME.MISSING',
         EXISTS:  'EADMIN.USERNAME.EXISTS'
      },
      PASSWORD: {
         TYPE: 'EADMIN.PASSWORD.TYPE'
      }
   },
   ACCESS: {
      CHECK: 'EACCESS.CHECK'
   },
   CHALLENGE: {
      TYPE: 'ECHALLENGE.TYPE',
      NOTFOUND: 'ECHALLENGE.NOTFOUND',
      USERNAME: {
         TYPE: 'ECHALLENGE.USERNAME.TYPE',
         NOTFOUND: 'ECHALLENGE.USERNAME.NOTFOUND'
      },
      NONCE: {
         TYPE: 'ECHALLENGE.NONCE.TYPE',
      },
      PROOF: {
         CHECK: 'ECHALLENGE.PROOF.CHECK'
      }
   },
   APPLICATION: {
      NAME: {
         MISSING: 'EAPPLICATION.NAME.MISSING',
         EXISTS:  'EAPPLICATION.NAME.EXISTS'
      }
   },
   CREDENTIALS: {
      USERNAME: {
         LENGTH: 'ECREDENTIAL.USERNAME.LENGTH',
         TYPE:   'ECREDENTIAL.USERNAME.TYPE',
         EXISTS: 'ECREDENTIAL.USERNAME.EXISTS'
      },
      PASSWORD: {
         LENGTH: 'ECREDENTIAL.PASSWORD.LENGTH',
         TYPE:   'ECREDENTIAL.PASSWORD.TYPE'
      }
   }
});



module.exports = { OP_ERR_CODES };
