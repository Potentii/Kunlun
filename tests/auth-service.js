let auth = undefined;

function get(){
   return auth;
}

function set(new_auth){
   auth = new_auth;
}

module.exports = { get, set };
