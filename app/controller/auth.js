const response = require('../response/index')
const authJwt = require('../middleware')
const httpStatus = require('http-status')
const { User } = require('../model/index')
const commonService = require('../services/common')
const { env } = require('../constant/environment')
const bcrypt = require('bcrypt')
const { tokenType, userType } = require('../constant/auth')
const jwt = require('jsonwebtoken')
const sendEmail = require('../utils/nodeMailer')
const sendSms = require('../utils/sendSms')
const { unlinkFile } = require('../utils/helper')

exports.login = async (req, res) => {
  try {
    const { email } = req.body
    const checkUser = await commonService.getByCondition(User, { email })
    const token = authJwt.generateAuthJwt({
      id: checkUser._id,
      expiresIn: env.TOKEN_EXPIRES_IN,
      email,
      tokenType: tokenType.LOGIN_TOKEN_TYPE,
      role: userType.USER
    })
    if (!token) {
      return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
    }
    const admin = await commonService.updateByCondition(User, { email }, { session: token })
    return response.success(req, res, { msgCode: 'USER LOGGED IN', admin }, httpStatus.OK)
  } catch (error) {
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.BAD_REQUEST)
  }
}

// exports.createSession = async (req, res) => {
//   try {
//     const { deviceId, deviceToken, deviceType } = req.loginData.device_details
//     const condition = { deviceId }

//     const checkSession = await commonService.getByCondition(Session, condition)
//     if (checkSession) {
//       const destroySession = await commonService.removeById(Session, checkSession._id)
//       if (!destroySession) {
//         return response.error(req, res, { msgCode: helper.getErrorMsgCode(req) }, httpStatus.FORBIDDEN)
//       }
//     }
//     const sessionData = {
//       auth_id: req.loginData.auth_details._id,
//       deviceId,
//       deviceToken,
//       deviceType,
//       jwt_token: req.loginData.auth_details.token
//     }

//     console.log('sessionData', sessionData)
//     const createSession = await commonService.create(Session, sessionData)
//     if (!createSession) {
//       return response.error(req, res, { msgCode: helper.getErrorMsgCode(req) }, httpStatus.FORBIDDEN)
//     }

//     const { ...data } = req.loginData.auth_details
//     const msgCode = 'LOGIN_SUCCESSFUL'
//     return response.success(req, res, { msgCode, data }, httpStatus.OK)
//   } catch (err) {
//     return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
//   }
// }

exports.logout = async (req, res) => {
  try {
    const condition = { email: req.data.email }
    const destroySession = await commonService.updateByCondition(User, condition, { session: null })
    if (!destroySession) {
      return response.error(req, res, { msgCode: 'USER_NOT_FOUND' }, httpStatus.INTERNAL_SERVER_ERROR)
    }
    return response.success(req, res, { msgCode: 'LOGOUT_SUCCESSFUL' }, httpStatus.OK)
  } catch (err) {
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
  }
}

// ----------------------------------------------------------------------------------------------------------

exports.signup = async (req, res) => {
  try {
    const { fullname, email, phone, password } = req.body
    const info = { fullname, email, phone }
    info.profileImage = req.file?.path
    const hashedPassword = await bcrypt.hash(password, 6)
    info.password = hashedPassword
    const user = await commonService.create(User, info)
    return response.success(req, res, { msgCode: 'REGISTRATION SUCCESSFUL', user }, httpStatus.OK)
  } catch (error) {
    unlinkFile(req)
    console.log(error)
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
  }
}

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    const user = await commonService.getByCondition(User, { email })
    const token = jwt.sign({ email: req.body.email, otp: env.BYPASS_OTP, tokenType: tokenType.FORGOT_TOKEN_TYPE }, env.SECRET_KEY, { expiresIn: env.TOKEN_EXPIRES_IN })
    if (!token) {
      return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR', user }, httpStatus.INTERNAL_SERVER_ERROR)
    }
    const updatedUser = await commonService.updateByCondition(User, { email }, { session: token })
    sendEmail(email)
    if (req.body.phone) {
      sendSms(req.body.phone)
    }
    return response.success(req, res, { msgCode: 'OTP GENERATED', updatedUser, token }, httpStatus.OK)
  } catch (error) {
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.BAD_REQUEST)
  }
}

exports.verifyOtp = async (req, res) => {
  try {
    const newToken = jwt.sign({ email: req.email, tokenType: tokenType.RESET_TOKEN_TYPE }, env.SECRET_KEY, { expiresIn: env.TOKEN_EXPIRES_IN })
    if (!newToken) {
      return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
    }
    const user = await commonService.updateByCondition(User, { email: req.email }, { session: newToken })
    return response.success(req, res, { msgCode: 'OTP VERIFICATION SUCCESSFUL', user }, httpStatus.OK)
  } catch (error) {
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.BAD_REQUEST)
  }
}

exports.resetPassword = async (req, res) => {
  try {
    const newPassword = bcrypt.hashSync(req.body.newPassword, 6)
    const user = await commonService.updateByCondition(User, { email: req.email }, { password: newPassword })
    return response.success(req, res, { msgCode: 'PASSWORD RESET SUCCCESSFULLY, PLEASE LOGIN', user }, httpStatus.OK)
  } catch (error) {
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.BAD_REQUEST)
  }
}

exports.logout = async (req, res) => {
  try {
    const user = await commonService.updateByCondition(User, { email: req.data.email }, { session: null })
    if (!user) {
      return response.error(req, res, { msgCode: 'ERROR LOGGING OUT' }, httpStatus.BAD_REQUEST)
    } else {
      return response.success(req, res, { msgCode: 'LOGGED OUT SUCCESSFULLY' }, httpStatus.OK)
    }
  } catch (error) {
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.BAD_REQUEST)
  }
}
