// We will create functions here after setting up the basic server/config setup
// next will help us in writing error handling
// entity wise this is middleware controller functions
// all functions are async since we are working with services on server or db connection
/**
 *
 * @param {*} req : http request argument to the middleware function, called "req" by convention
 * @param {*} res : http response argument to the middleware function, called "res" by convention
 * @param {*} next : Callback argument to the middleware function, called "next" by convention
 */
const crypto = require('crypto')
const User = require('../models/User')
const ErrorResponse = require('../utils/errorResponse')
const sendEmail = require('../utils/sendEmail')

exports.register = async (req, res, next) => {
  // res.send("Register Route")   --  Used only for initial setup and postman check
  const { username, email, password, role } = req.body
  // Hereby we use async code using a try catch block
  // We will also be hashing the password for security - check User.js
  try {
    const user = await User.create({
      username,
      email,
      password,
      role,
    })
    // res.status(201).json({
    //     success: true,
    //     // Earlier user but now we will be returning token for each unique user
    //     //user,
    //     token: "2342h4gkj4kj234k23j4b"
    // })
    // we will be using token service hereafter
    sendToken(user, 201, res)
  } catch (error) {
    // res.status(500).json({
    //     success: false,
    //     error: error.message,
    // })
    // We will now use custom error response from middleware
    next(error)
  }
}

exports.transaction = async (req, res, next) => {
  // res.send("Register Route")   --  Used only for initial setup and postman check
  const { ticker, value, qty, date } = req.body
  // Hereby we use async code using a try catch block
  // We will also be hashing the password for security - check User.js
  try {
    const user = await User.findByIdAndUpdate({
      ticker,
      value,
      qty,
      date,
    })
    // res.status(201).json({
    //     success: true,
    //     // Earlier user but now we will be returning token for each unique user
    //     //user,
    //     token: "2342h4gkj4kj234k23j4b"
    // })
    // we will be using token service hereafter
    sendToken(user, 201, res)
  } catch (error) {
    // res.status(500).json({
    //     success: false,
    //     error: error.message,
    // })
    // We will now use custom error response from middleware
    next(error)
  }
}

exports.login = async (req, res, next) => {
  //res.send("Login Route")

  const { email, password } = req.body
  // this we will check in front-end as part of form validation however it is a good practice to do it here
  if (!email || !password) {
    // res.status(400).json({success: false, error:"Please provide email and password"})
    return next(new ErrorResponse('Please provide email and password', 400))
  }

  try {
    // we are picking the user from the db and comapring the password with the encrypted password
    // received from frontend.
    // the password here is the "this.password" refered to in Users.js > matchpassword method under compare"
    const user = await User.findOne({ email }).select('+password')

    if (!user) {
      // res.status(401).json({success: false, error:"Invalid credentials"})
      return next(new ErrorResponse('Invalid Credentials', 401))
    }

    const isMatch = await user.matchPasswords(password)

    if (!isMatch) {
      // res.status(401).json({success: false, error:"password doesn't match"})
      return next(new ErrorResponse("password doesn't match", 401))
    }

    // res.status(200).json({
    //     success: true,
    //     token: "jk3h4k23h4kj34h2k",
    // })
    sendToken(user, 200, res)
  } catch (error) {
    // res.status(500).json({
    //     success: false,
    //     error: error.message,
    // })
    // We will now use custom error response from middleware
    next(error)
  }
}

exports.forgotpassword = async (req, res, next) => {
  // res.send("forgot password Route")
  const { email } = req.body

  try {
    // to check if the user exists with this emailid
    const user = await User.findOne({ email })
    if (!user) {
      // this is a form of brute force security measure to say "Email could not be sent"
      // we dont want the user to know if the email exists or doesnt exists in the db.
      return next(new ErrorResponse('Email could not be sent', 404))
    }
    // goto user.js and regenerate token... we create getResetPasswordToken method
    const resetToken = user.getResetPasswordToken()

    await user.save()
    //this link is referenced in routing in frontend, check App.js file
    const resetUrl = `http://localhost:3000/passwordreset/${resetToken}`
    // can use PUG template to write good looking html code here...
    // also clicktracking is turned to off to stop browser from retracking especially mails etc...
    const message = `
        <h1>You have requested a password reset</h1>
        <p>Please goto this link to reset your password</p>
        <a href=${resetUrl} clicktracking=off>${resetUrl} </a>
        `
    // we use another try catch inside try to create our email: node mailer and sendgrid
    // create a sendEmail.js file in utils
    try {
      await sendEmail({
        to: user.email,
        subject: 'Password reset request',
        text: message,
      })
      res.status(200).json({ success: true, data: 'Email Sent' })
    } catch (error) {
      // incase of failure we don't want the unutilized token to stick around.
      user.resetPasswordToken = undefined
      user.resetPasswordExpire = undefined

      await user.save()

      return next(new ErrorResponse('Email could not be sent', 500))
    }
  } catch (error) {
    next(error)
  }
}

exports.resetpassword = async (req, res, next) => {
  // res.send("reset password Route")
  // we recreate the reset token
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex')

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    })

    if (!user) {
      // check for expired token
      return next(new ErrorResponse('Invalid reset token', 400))
    }
    // assign the password the value of one available afresh in the body now and set token/expire to undefined so that the user can't use it again.
    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    // save user info
    await user.save()
    // check for success
    res.status(201).json({
      success: true,
      data: 'Password reset success.',
    })
  } catch (error) {
    next(error)
  }
}

const sendToken = (user, statusCode, res) => {
  const token = user.getsignedToken()
  res.status(statusCode).json({ success: true, token })
  console.log('response', res)
}
