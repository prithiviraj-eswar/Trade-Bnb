const express = require('express')
// instead of using the app in the server.js we use router
const router = express.Router()

const { register, login, forgotpassword, resetpassword } = require('../controllers/auth')
const User = require('../models/User')
// we could have also used router.post("/register", func)
router.route('/register').post(register)

router.route('/login').post(login)

router.route('/forgotpassword').post(forgotpassword)
// resetpassword is essentially a PUT request , ammended later from POST
router.route('/resetpassword/:resetToken').put(resetpassword)

module.exports = router
