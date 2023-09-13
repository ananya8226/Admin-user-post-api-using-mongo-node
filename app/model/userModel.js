const db = require('../config/database').getUserDB()
const { statusType, userType } = require('../constant/auth')
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: [statusType.ACTIVE, statusType.INACTIVE, statusType.DELETE, statusType.PENDING],
    required: true,
    default: statusType.PENDING
  },
  profileImage: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: [userType.USER, userType.ADMIN],
    required: true,
    default: userType.USER
  },
  phone: {
    type: String
    // required: true,
    // unique: true
  },
  session: {
    type: String
  }
},
{
  timestamps: true,
  versionKey: false
}
)

const User = db.model('users', userSchema)
module.exports = User
