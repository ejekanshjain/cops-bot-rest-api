if (process.env.NODE_ENV != 'production') {
    require('dotenv').config()
}
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const fs = require('fs')
const path = require('path')

const app = express()
const port = process.env.PORT || 3000
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

app.use(cors({
    "origin": "*",
    "methods": "GET,POST,CHECKOUT,DELETE,NOTIFY",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
}))
app.use(express.json())
app.use(morgan('combined', { stream: accessLogStream }))

app.get('/', (req, res) => {
    res.json({ status: 200, message: 'COPS Bot Server Up and Running...' })
})

app.use('/api', require('./routes'))

app.listen(port, () => console.log(`${process.env.NODE_ENV != 'production' ? 'Development' : 'Production'} server started on port ${port}...`))