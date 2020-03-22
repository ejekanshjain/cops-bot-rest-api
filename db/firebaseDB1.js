if (process.env.NODE_ENV != 'production') {
    require('dotenv').config()
}
const firebase = require('firebase')

firebase.initializeApp({
    databaseURL: process.env.FIREBASE_DB1_URL,
    credential: process.env.FIREBASE_DB1_CREDENTIAL
})

module.exports = firebase.app().database().ref()