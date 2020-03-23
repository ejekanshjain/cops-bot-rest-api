if (process.env.NODE_ENV != 'production') {
    require('dotenv').config()
}
const express = require('express')
const twilio = require('twilio')
const fetch = require('node-fetch')

const { getRegion, regions } = require('../utilities')

const router = express.Router()

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const port = process.env.PORT || 3000

const twilioClient = twilio(accountSid, authToken)

router.post('/', async (req, res) => {
    const { complaintId, region } = req.body
    if (complaintId == '' || complaintId == null) return res.status(400).json({ status: 400, message: `'complaintId' is required` })
    if (region == '' || region == null) return res.status(400).json({ status: 400, message: `'Regoin' is required` })
    let complaint
    try {
        let fetchedComplaint = await fetch(`http://localhost:${port}/api/complaints/${complaintId}?firebase=true`)
        fetchedComplaint = await fetchedComplaint.json()
        if (fetchedComplaint.status == 404) return res.status(404).json({ status: fetchedComplaint.status, message: fetchedComplaint.message })
        complaint = fetchedComplaint.complaint
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: 500, message: `Internal Server Error` })
    }
    let police
    try {
        let fetchedPolice = await fetch(`http://localhost:${port}/api/users?police=true`)
        fetchedPolice = await fetchedPolice.json()
        if (fetchedPolice.count == 0) return res.status(400).json({ status: 400, message: `No police users` })
        police = fetchedPolice.users
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: 500, message: `Internal Server Error` })
    }
    let finalPoliceList = []
    if (region == 'ALL') {
        finalPoliceList.push(...police)
    } else if (region == 'NEARBY') {
        const sentAtRegion = getRegion(parseFloat(complaint.ilat), parseFloat(complaint.ilng)).toLowerCase()
        police = police.filter(p => p.region == sentAtRegion)
        finalPoliceList.push(...police)
    } else {
        const matchedRegion = regions.filter(r => r.station == region ? r : null)
        if (matchedRegion.length == 0) return res.status(400).json({ status: 400, message: `'Region' is invalid` })
        police = police.filter(p => p.region == matchedRegion[0].station.toLowerCase())
        finalPoliceList.push(...police)
    }
    const phoneNumberList = finalPoliceList.map(p => p.phoneNumber)
    phoneNumberList.forEach(phn => {
        twilioClient.messages.create({
            from: `whatsapp:+14155238886`,
            body: `Name: ${complaint.name}\nAge: ${complaint.age}\nGender: ${complaint.gender}\nComplaint: ${complaint.complaint}\nPh. No. ${complaint.phoneNumber}\nCoordinates: ${complaint.ilat}, ${complaint.ilng}\nDate of Incident: ${complaint.dateOfIncident}\nTime of Incident: ${complaint.timeOfIncident}\n\nThis message was sent from COPSBOT`,
            to: `whatsapp:+91${phn}`
        })
    })
    res.status(200).json({ status: 200, message: `Message Sent` })
})

module.exports = router