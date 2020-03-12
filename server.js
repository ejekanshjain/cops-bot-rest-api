require('dotenv').config()
const express = require('express')

const app = express()
const port = process.env.PORT || 3000

app.get('/', (req, res) => {
    res.json({ status: 200, message: 'COPS Bot Server Up and Running...' })
})

app.listen(port, () => console.log(`Server started on port ${port}...`))