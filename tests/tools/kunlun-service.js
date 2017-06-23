let kunlun = undefined;

function get(){
   return kunlun;
}

function set(new_kunlun){
   kunlun = new_kunlun;
}

module.exports = { get, set };
