# Authenticating users

The user authentication process consists of two steps that will be called from now on:
-   [Login](#login)
-   [Access check](#access_check)

## Login

The login flow is basically a SCRAM flow that generates an [access token]() at the end if everything went ok. This token is the proof that the client is who they told they were.

The username and it's password (a salted and hashed version of it actually) will be needed to generate such a proof.

For performance reasons, this part of the authentication may be done once, and re-done every time a new access token is needed to be generated, as it has an [expiration time]().

### Starting a new SCRAM challenge

To start a SCRAM flow, you can use the [_`kunlun.challenges.generateNew`_]() method:

```javascript
let application_name = '...';
let username         = '...';
let client_nonce     = '...';

// *Starting a new challenge:
kunlun.challenges.generateNew(application_name, username, client_nonce)
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

### Answering the challenge

In order to check the provided answer, kunlun has the [_`kunlun.challenges.checkAnswer`_]() method:

_**Note:** The `client_proof` **must** be encoded in `base64`._

```javascript
let application_name = '...';
let challenge_id     = '...';
let client_proof     = '...';

// *Starting a new challenge:
kunlun.challenges.checkAnswer(application_name, challenge_id, client_proof)
   .then(result => {
      // The returned result has the access token and the server signature for mutual authentication...
      let token            = result.token;
      let server_signature = result.server_signature;
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

_**See:** [Generating the challenge answer]()._

_**See:** [Mutual authentication]()._

<br><br>

## Access check

Every time the user wants to do some action on the system, it's recommended to do an access check on their token first.

This flow needs the username and the token previously generated on the [login phase](#login).

```javascript
// *Getting the username and token somehow:
let username = '...';
let token    = '...';

// *Checking the credentials:
kunlun.accesses.check(username, token)
   .then(credential => {
      // The user provided the correct access token...
   })
   .catch(err => {
      // *Checking the error code:
      if(err instanceof kunlun.types.KunlunError)
         switch(err.code){
         case kunlun.errors.KUNLUN_ERR_CODES.ACCESS.CHECK.TOKEN:
            // The token was incorrect...
            break;
         case kunlun.errors.KUNLUN_ERR_CODES.ACCESS.CHECK.USERNAME:
            // The username doesn't exist...
            break;
         }
   });
```
