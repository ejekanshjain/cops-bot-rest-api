const express = require('express')

const router = express.Router()

const { firebaseDB } = require('../db')
const { Complaint } = require('../models')

const usersRef = firebaseDB.child('Registered_Users')

router.get('/', async (req, res) => {
    if (req.query.firebase == 'true') {
        const snap = await firebaseDB.once('value')
        const allData = snap.val()
        const complaints = []
        Object.keys(allData).forEach((key, index) => {
            if (allData[key].Complaints) {
                const complaint = {
                    _id: key,
                    name: allData[key].Complaints.name,
                    age: allData[key].Complaints.age,
                    gender: allData[key].Complaints.gender,
                    complaint: allData[key].Complaints.complaint,
                    ilat: allData[key].Complaints.ilat,
                    ilng: allData[key].Complaints.ilng,
                    status: allData[key].Complaints.status,
                    timeStamp: allData[key].Complaints.timeStamp
                }
                complaints.push(complaint)
            }
        })
        res.json({ status: 200, message: 'List of complaints', complaints, count: complaints.length })
    } else {
        let complaints
        if (req.query.user) {
            complaints = await Complaint.find({ uid: req.query.user })
        } else {
            complaints = await Complaint.find()
        }
        res.json({ status: 200, message: 'List of closed complaints', complaints, count: complaints.length })
    }
})

router.get('/:id', async (req, res) => {
    if (req.query.firebase == 'true') {
        const complaintsRef = firebaseDB.child(req.params.id)
        const snap = await complaintsRef.once('value')
        let originalComplaint = snap.val()
        if (originalComplaint) {
            const snap = await usersRef.once('value')
            const originalUsers = snap.val()
            const userData = originalUsers[req.params.id]
            let complaint = originalComplaint.Complaints
            if (userData) {
                complaint = {
                    _id: req.params.id,
                    name: complaint.name,
                    age: complaint.age,
                    gender: complaint.gender,
                    complaint: complaint.complaint,
                    IMEI: userData.IMEI,
                    phoneNumber: userData.phoneNumber,
                    ilat: complaint.ilat,
                    ilng: complaint.ilng,
                    status: complaint.status,
                    timeStamp: complaint.timeStamp
                }
                res.json({ status: 200, id: req.params.id, complaint })
            } else {
                res.json({ status: 404, message: 'Complaint not found' })
            }
        } else {
            res.json({ status: 404, message: 'Complaint not found' })
        }
    } else {
        try {
            const complaint = await Complaint.findOne({ _id: req.params.id })
            if (complaint) {
                res.json({ status: 200, complaint })
            } else {
                res.json({ status: 404, message: 'Complaint not found' })
            }
        } catch (err) {
            if (err.message.includes('Cast to ObjectId failed for value')) {
                res.json({ status: 404, message: 'Complaint not found' })
            }
            else {
                console.log(err)
            }
        }
    }
})

router.checkout('/:id', async (req, res) => {
    const complaintsRef = firebaseDB.child(req.params.id)
    const snap = await complaintsRef.once('value')
    let originalComplaint = snap.val()
    if (originalComplaint) {
        let complaint = originalComplaint.Complaints
        if (complaint.status == 0) {
            complaint.status = 1
            await complaintsRef.update({
                Complaints: {
                    age: complaint.age,
                    complaint: complaint.complaint,
                    gender: complaint.gender,
                    ilat: complaint.ilat,
                    ilng: complaint.ilng,
                    name: complaint.name,
                    status: "1",
                    timeStamp: complaint.timeStamp
                }
            })
            res.json({ status: 200, complaint, statusBefore: 0 })
        } else if (complaint.status == 1) {
            complaint.status = 2
            Complaint.create({
                uid: req.params.id,
                name: complaint.name,
                age: complaint.age,
                gender: complaint.gender,
                complaint: complaint.complaint,
                ilat: complaint.ilat,
                ilng: complaint.ilng,
                status: complaint.status,
                timeStamp: complaint.timeStamp
            })
            complaintsRef.remove()
            res.json({ status: 200, complaint, statusBefore: 1 })
        } else {
            res.json({ status: 500, message: 'Internal Server Error' })
        }
    } else {
        res.json({ status: 404, message: 'Complaint not found' })
    }
})

module.exports = router