const db = require('../config/database').getUserDB()
const { statusType } = require('../constant/auth')
const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  status: {
    type: String,
    enum: [statusType.ACTIVE, statusType.INACTIVE],
    required: true,
    default: statusType.ACTIVE
  }
},
{
  timestamps: true,
  versionKey: false
}
)

const Post = db.model('posts', postSchema)
module.exports = Post
