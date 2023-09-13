const db = require('../config/database').getUserDB()
const mongoose = require('mongoose')

const followerSchema = new mongoose.Schema({
  followerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  followingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  }
})

const Follower = db.model('followers', followerSchema)
module.exports = Follower
