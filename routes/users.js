const express = require('express')

const router = express.Router()

const { firebaseDB1, firebaseDB2 } = require('../db')

const usersRef = firebaseDB1.child('Registered_Users')
const policeRef = firebaseDB2.child('police')

router.get('/', async (req, res) => {
    if (req.query.police == 'true') {
        if (req.query.region) {
            const users = []
            const snap = await policeRef.once('value')
            const originalData = snap.val()
            const regions = Object.keys(originalData).filter(key => key == req.query.region)
            regions.forEach(region => {
                const regionalUsers = originalData[region]
                Object.keys(regionalUsers).forEach(userId => {
                    const { name, number, latitude, longitude } = regionalUsers[userId]
                    users.push({
                        _id: userId,
                        name,
                        phoneNumber: number,
                        region,
                        latitude,
                        longitude
                    })
                })
            })
            const count = users.length
            res.json({ status: 200, message: 'List of registered users', users, count })
        } else {
            const users = []
            const snap = await policeRef.once('value')
            const originalData = snap.val()
            const regions = Object.keys(originalData).map(key => key)
            regions.forEach(region => {
                const regionalUsers = originalData[region]
                Object.keys(regionalUsers).forEach(userId => {
                    const { name, number, latitude, longitude } = regionalUsers[userId]
                    users.push({
                        _id: userId,
                        name,
                        phoneNumber: number,
                        region,
                        latitude,
                        longitude
                    })
                })
            })
            const count = users.length
            res.json({ status: 200, message: 'List of registered users', users, count })
        }
    } else {
        const snap = await usersRef.once('value')
        const originalUsers = snap.val()
        const users = []
        Object.keys(originalUsers).forEach((key, index) => {
            let tempUser = originalUsers[key]
            users.push({
                _id: key,
                IMEI: tempUser.IMEI,
                latitude: tempUser.latitude,
                longitude: tempUser.longitude,
                phoneNumber: tempUser.phoneNumber
            })
        })
        const count = users.length
        res.json({ status: 200, message: 'List of registered users', users, count })
    }
})

module.exports = router