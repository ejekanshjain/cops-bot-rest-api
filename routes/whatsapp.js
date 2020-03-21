require('dotenv').config()
const express = require('express')
const twilio = require('twilio')
const fetch = require('node-fetch')

const router = express.Router()

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const port = process.env.PORT || 3000

const twilioClient = twilio(accountSid, authToken)

router.post('/', async (req, res) => {
    if (req.body.phoneNumber) req.body.phoneNumber = parseInt(req.body.phoneNumber)
    const { phoneNumber, complaintId } = req.body
    if (phoneNumber == '' || phoneNumber == null) return res.status(400).json({ status: 400, message: `'phoneNumber' is required` })
    if (complaintId == '' || complaintId == null) return res.status(400).json({ status: 400, message: `'complaintId' is required` })
    let complaint
    try {
        let fetchedComplaint = await fetch(`http://localhost:${port}/api/complaints/${complaintId}?firebase=true`)
        fetchedComplaint = await fetchedComplaint.json()
        if (fetchedComplaint.status == 404) return res.status(404).json({ status: fetchedComplaint.status, message: fetchedComplaint.message })
        complaint = fetchedComplaint.complaint
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: 500, message: `Internal Server Error` })
    }
    try {
        const messageSent = await twilioClient.messages.create({
            from: `whatsapp:+14155238886`,
            body: `Name: ${complaint.name}
            Age: ${complaint.age}  Gender: ${complaint.gender}  Complaint: ${complaint.complaint}  Ph. No. ${complaint.phoneNumber}  Coordinates: ${complaint.ilat} ${complaint.ilng}  Date of Incident: ${complaint.dateOfIncident}  Time of Incident: ${complaint.timeOfIncident}  This message was sent from COPS BOT`,
            to: `whatsapp:+91${phoneNumber}`
        })
        res.status(201).json({ status: 201, message: `Message Sent to ${phoneNumber}`, messageSent })
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: 500, message: `Internal Server Error` })
    }
})

module.exports = router