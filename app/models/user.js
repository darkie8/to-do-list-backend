const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const date = require('./../libs/timeLib')
let userSchema = new Schema({
  userId: {
    type: String,
    default: '',
    index: true,
    unique: true
  },
  firstName: {
    type: String,
    default: ''
  },
  lastName: {
    type: String,
    default: ''
  },
  password: {
    type: String,
    unique: true
  },
  email: {
    type: String,
    default: ''
  },
  mobileNumber: {
    type: Number,
    default: 000000
  },
  createdOn: {
    type: Date,
    default: ""
  },
  modifiedOn: {
    type: Date,
    default: ""
  },
  active: {
    type: Boolean,
    default: false
  },
  profilePicture: {
    type: String,
    default: ''
  }

})


mongoose.model('User_1', userSchema);