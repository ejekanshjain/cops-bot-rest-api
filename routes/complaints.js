const express = require('express')

const router = express.Router()

const { firebaseDB1 } = require('../db')
const { Complaint, FakeComplaint } = require('../models')
const { getRegion } = require('../utilities')

const usersRef = firebaseDB1.child('Registered_Users')

let numberOfOldComplaints = 0
let numberOfNewComplaints = 0

setInterval(() => {
    numberOfOldComplaints = 0
    numberOfNewComplaints = 0
}, (1000 * 60 * 60 * 24));

router.get('/', async (req, res) => {
    if (req.query.firebase == 'true') {
        const snap = await firebaseDB1.once('value')
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
        let tempOldComplaints = numberOfOldComplaints
        numberOfOldComplaints = numberOfNewComplaints
        res.json({ status: 200, message: 'List of complaints', complaints, count: complaints.length, newComplaintsCount: numberOfNewComplaints - tempOldComplaints })
    } else if (req.query.notify == 'true') {
        numberOfNewComplaints++
        res.json({ status: 200, numberOfOldComplaints, numberOfNewComplaints })
    } else if (req.query.fake == 'true') {
        let complaints
        if (req.query.user) {
            complaints = await FakeComplaint.find({ uid: req.query.user })
        } else {
            complaints = await FakeComplaint.find()
        }
        res.json({ status: 200, message: 'List of Fake complaints', complaints, count: complaints.length })
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
        const complaintsRef = firebaseDB1.child(req.params.id)
        const snap = await complaintsRef.once('value')
        let originalComplaint = snap.val()
        if (originalComplaint) {
            const snap = await usersRef.once('value')
            const originalUsers = snap.val()
            const userData = originalUsers[req.params.id]
            let complaint = originalComplaint.Complaints
            if (userData) {
                const splitDateTime = complaint.timeStamp.split('_')
                const region = getRegion(complaint.ilat, complaint.ilng)
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
                    region,
                    status: complaint.status,
                    dateOfIncident: splitDateTime[0],
                    timeOfIncident: splitDateTime[1],
                    timeStamp: complaint.timeStamp
                }
                res.json({ status: 200, id: req.params.id, complaint })
            } else {
                res.status(404).json({ status: 404, message: 'Complaint not found' })
            }
        } else {
            res.status(404).json({ status: 404, message: 'Complaint not found' })
        }
    } else if (req.query.fake == 'true') {
        try {
            const complaint = await FakeComplaint.findOne({ _id: req.params.id })
            if (complaint) {
                res.json({ status: 200, complaint })
            } else {
                res.status(404).json({ status: 404, message: 'Complaint not found' })
            }
        } catch (err) {
            if (err.message.includes('Cast to ObjectId failed for value')) {
                res.status(404).json({ status: 404, message: 'Complaint not found' })
            }
            else {
                console.log(err)
                return res.status(500).json({ status: 500, message: 'Internal Server Error' })
            }
        }
    } else {
        try {
            const complaint = await Complaint.findOne({ _id: req.params.id })
            if (complaint) {
                res.json({ status: 200, complaint })
            } else {
                res.status(404).json({ status: 404, message: 'Complaint not found' })
            }
        } catch (err) {
            if (err.message.includes('Cast to ObjectId failed for value')) {
                res.status(404).json({ status: 404, message: 'Complaint not found' })
            }
            else {
                console.log(err)
                return res.status(500).json({ status: 500, message: 'Internal Server Error' })
            }
        }
    }
})

router.checkout('/:id', async (req, res) => {
    const complaintsRef = firebaseDB1.child(req.params.id)
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
            res.json({ status: 200, id: req.params.id, complaint, statusBefore: 1 })
        } else {
            console.log(err)
            res.status(500).json({ status: 500, message: 'Internal Server Error' })
        }
    } else {
        res.status(404).json({ status: 404, message: 'Complaint not found' })
    }
})

router.notify('/', (req, res) => {
    numberOfNewComplaints++
    res.json({ status: 200, numberOfOldComplaints, numberOfNewComplaints })
})

router.delete('/:id', async (req, res) => {
    const complaintsRef = firebaseDB1.child(req.params.id)
    const snap = await complaintsRef.once('value')
    let originalComplaint = snap.val()
    if (originalComplaint) {
        let complaint = originalComplaint.Complaints
        if (complaint.status != '0') {
            res.status(400).json({ status: 400, message: 'You can only delete complaint with status Pending (0)' })
        } else {
            FakeComplaint.create({
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
            res.json({ status: 200, id: req.params.id, message: 'Complaint deleted successfully', complaint })
        }
    } else {
        res.status(404).json({ status: 404, message: 'Complaint not found' })
    }
})

module.exports = router