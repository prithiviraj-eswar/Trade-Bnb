const express = require('express')
const router = express.Router()
const { getPrivateData } = require('../controllers/private')
const { protect } = require('../middleware/auth')
const User = require('../models/User')
// debugger
router.route('/market').get(protect, getPrivateData)

module.exports = router

// create a private.js file in controller
