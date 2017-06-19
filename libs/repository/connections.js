const db = require('./database');
const { Schema } = require('mongoose');
const { COLLECTIONS } = require('./model/meta');

const CONNECTIONS = Object.freeze({
   READ:       'read',
   DB_ADMIN:   'db-admin',
   READ_WRITE: 'read-write',
   USER_ADMIN: 'user-admin'
});

const core_connections = new Map();

function connectAndSyncUserAdmin(settings){
   return connectAndSync(CONNECTIONS.USER_ADMIN, settings);
}

function connectAndSyncDBAdmin(settings){
   return connectAndSync(CONNECTIONS.DB_ADMIN, settings);
}

function connectAndSyncRead(settings){
   return connectAndSync(CONNECTIONS.READ, settings);
}

function connectAndSyncReadWrite(settings){
   return connectAndSync(CONNECTIONS.READ_WRITE, settings);
}

function connectAndSync(connection_name, settings){
   return db.connectAndSync(settings)
      .then(conn => {
         core_connections.set(connection_name, conn);
         return conn;
      });
}

function getCoreConnection(connection_name){
   return core_connections.get(connection_name);
}
