const fs = require('fs')

exports.generateOtp = (digit) => {
  const otp = Math.floor(
    10 ** (digit - 1) + Math.random() * (10 ** (digit - 1) * 9)
  )
  return otp
}

exports.getPagination = (page, size) => {
  const limit = size || 10
  const offset = page ? (page - 1) * limit : 0
  return { limit, offset }
}

exports.getSuccessMsgCode = (req) => {
  let msgCode
  if (req.url.slice(1) === 'signup') {
    msgCode = 'SIGNUP_SUCCESSFUL'
  } else {
    msgCode = 'LOGIN_SUCCESSFUL'
  }
  return msgCode
}

exports.getErrorMsgCode = (req) => {
  let msgCode
  if (req?.url.slice(1) === 'signup') {
    msgCode = 'SIGNUP_FAILED'
  } else {
    msgCode = 'LOGIN_FAILED'
  }
  return msgCode
}

exports.unlinkFile = (req) => {
  if (req.file) {
    fs.unlink(req.file.path, (error) => {
      console.log("Image can't be deleted", error)
    })
  }
}
