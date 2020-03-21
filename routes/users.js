const express = require('express')

const router = express.Router()

const { firebaseDB1 } = require('../db')

const usersRef = firebaseDB1.child('Registered_Users')

router.get('/', async (req, res) => {
    const snap = await usersRef.once('value')
    const originalUsers = snap.val()
    const users = []
    Object.keys(originalUsers).forEach((key, index) => {
        let tempUser = originalUsers[key]
        let user = {
            _id: key,
            IMEI: tempUser.IMEI,
            latitude: tempUser.latitude,
            longitude: tempUser.longitude,
            phoneNumber: tempUser.phoneNumber
        }
        users.push(user)
    })
    const count = users.length
    res.json({ status: 200, message: 'List of registered users', users, originalUsers, count })
})

module.exports = router