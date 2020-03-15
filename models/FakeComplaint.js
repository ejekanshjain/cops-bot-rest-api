const mongoose = require('mongoose')

const FakeComplaintSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    age: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    complaint: {
        type: String,
        required: true
    },
    ilat: {
        type: String,
        required: true
    },
    ilng: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    timeStamp: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('FakeComplaints', FakeComplaintSchema)