const express = require('express')

const router = express.Router()

router.get('/', (req, res) => {
    res.json({ status: 200, message: 'COPS Bot API Server Up and Running...' })
})

router.use('/users', require('./users'))
router.use('/complaints', require('./complaints'))

module.exports = router