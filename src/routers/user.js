const express = require('express')
const router = new express.Router()

router.get('/test', (req, res) => {
    res.send('from other router file!')
})

module.exports = router