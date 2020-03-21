require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()
const port = process.env.PORT || 3000

app.use(cors({
    "origin": "*",
    "methods": "GET,CHECKOUT,DELETE,NOTIFY",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
}))
app.use(express.json())

app.get('/', (req, res) => {
    res.json({ status: 200, message: 'COPS Bot Server Up and Running...' })
})

app.use('/api', require('./routes'))

app.listen(port, () => console.log(`Server started on port ${port}...`))