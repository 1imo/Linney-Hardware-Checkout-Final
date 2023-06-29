const admin = require("firebase-admin");

const serviceAccount = require("./barebones2-a3934-firebase-adminsdk-8w46c-040d577022.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = db;