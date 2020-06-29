const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },

  firstName: {
    type: String,
  },

  lastName: {
    type: String,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: { type: String, minlength: 6 },

  contactNumber: {
    type: String,
  },
  created: {
    type: Date,
    default: Date.now(),
  },
})

module.exports = mongoose.model('User', userSchema)
