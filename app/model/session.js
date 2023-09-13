const mongoose = require('mongoose');
const { statusType } = require('../constant/auth');
const db = require('../config/database').getUserDB();

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'users',
    required: true
  },
  device_id: {
    type: String,
    required: true
  },
  device_token: {
    type: String,
    default: ''
  },
  device_type: {
    type: String,
    required: true
  },
  jwt_token: {
    type: String,
    default: ''
  },
  status: {
    type: Number,
    enum: [statusType.active, statusType.inActive, statusType.delete],
    required: true
  }

},
{
  timestamps: true,
  versionKey: false
}
);

const Session = db.model('sessions', sessionSchema);

module.exports =
  Session;
