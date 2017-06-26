# Registering new users

To register a user to an existing application, you can use the [_`kunlun.credentials.add`_]() method:

```javascript
let application_name = '...';
let username         = '...';
let password         = '...';
let client_secret    = '...';

// *Creating a new user:
kunlun.credentials.add(application_name, username, password, client_secret)
   .then(result => {
      // The returned result has all the needed info to proceed with the challenge...
      let challenge_id   = result.id;
      let password_salt  = result.salt;
      let password_it    = result.it;
      let server_secret  = result.server_secret;
      let combined_nonce = result.combined_nonce;
   })
   .catch(err => {
      // *Checking the error code:
      if(err instanceof kunlun.types.KunlunError)
         switch(err.code){
         case kunlun.errors.KUNLUN_ERR_CODES.CHALLENGE.USERNAME.TYPE:
            // The username is not a string...
            break;
         case kunlun.errors.KUNLUN_ERR_CODES.CHALLENGE.NONCE.TYPE:
            // The nonce is not a string...
            break;
         case kunlun.errors.KUNLUN_ERR_CODES.CHALLENGE.USERNAME.NOTFOUND:
            // The username doesn't exist...
            break;
         }
   });
```
