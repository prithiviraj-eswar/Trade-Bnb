const mongoose = require('mongoose')
const crypto = require('crypto')
const uniquevalidator = require('mongoose-unique-validator')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const bcrypt = require('bcryptjs')

let UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    minlength: 3,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    trim: true,
    minlength: 1,
    unique: true,
    index: true,
    match: [/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/, 'Please provide a valid email'],
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email',
    },
  },
  password: {
    type: String,
    require: [true, 'Please add a password'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
})

UserSchema.pre('save', async function (next) {
  let user = this

  if (!user.isModified('password')) {
    next()
  }

  const salt = await bcrypt.genSalt(10)
  user.password = await bcrypt.hash(user.password, salt)
  next()
})

// This method will run against some user schema <=> some user model and compare the two passwords
// password in db vs password entered by the client/User
UserSchema.methods.matchPasswords = async function (password) {
  return await bcrypt.compare(password, this.password)
}

// we define a method to procure json web token for each user and pass it to auth.js for authentication
// type node on terminal.
//type require('crypto').randomBytes(35).toString("hex")
//generates >> '2f5b5e8ecd0077e3d8c0b031620a52e41f1c9d6cc715d4729205ad97f5fcc21ea3c284'
// to be used as JWT_Secret
UserSchema.methods.getsignedToken = function () {
  let user = this
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE })
}

// we use the same crypto method to do this, like the one we used for getsignedToken on node. Just import crypto above
// plus we will hash the token
UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex')

  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
  // set expiration to 10 minutes.
  this.resetPasswordExpire = Date.now() + 10 * (60 * 1000)

  return resetToken
}
UserSchema.plugin(uniquevalidator)

const User = mongoose.model('User', UserSchema)

module.exports = User
