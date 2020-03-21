require('dotenv').config()
const firebase = require('firebase')

firebase.initializeApp({
    databaseURL: process.env.FIREBASE_DB2_URL,
    credential: process.env.FIREBASE_DB2_CREDENTIAL
}, 'PoliceApp')

module.exports = firebase.app('PoliceApp').database().ref()