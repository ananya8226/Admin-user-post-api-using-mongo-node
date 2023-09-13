const jwt = require('jsonwebtoken')
const response = require('../response/index')
const httpStatus = require('http-status')
const commonService = require('../services/common')
const model = require('../model/index')
const { env } = require('../constant/environment')
const constant = require('../constant/auth')
const bcrypt = require('bcrypt')
const { signUpSchema, loginSchema } = require('../validation/auth')
const { unlinkFile } = require('../utils/helper')

// This function is used for validate API key

exports.verifyApiKey = (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key']
    if (!apiKey) {
      return response.error(req, res, { msgCode: 'MISSING_API_KEY' }, httpStatus.UNAUTHORIZED)
    }

    if (apiKey !== env.API_KEY) {
      return response.error(req, res, { msgCode: 'INVALID_API_KEY' }, httpStatus.UNAUTHORIZED)
    }
    return next()
  } catch (error) {
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
  }
}

// This function is used for generate jwt token

exports.generateAuthJwt = (payload) => {
  const { expiresIn, id, email, tokenType, role } = payload
  const token = jwt.sign({ id, email, tokenType, role }, env.SECRET_KEY, { expiresIn })
  if (!token) {
    console.log('token not generated')
    return false
  }
  return token
}

exports.verifyAuthToken = async (req, res, next) => {
  try {
    let token = req.headers.authorization
    if (!token) {
      return response.error(req, res, { msgCode: 'MISSING_TOKEN' }, httpStatus.UNAUTHORIZED)
    }
    token = token.replace(/^Bearer\s+/, '')

    jwt.verify(token, env.SECRET_KEY, async (error, decoded) => {
      if (error) {
        let msgCode = 'INVALID_TOKEN'
        if (error.message === constant.errorMsg.EXPIRED) {
          msgCode = 'TOKEN_EXPIRED'
        }
        return response.error(req, res, { msgCode }, httpStatus.UNAUTHORIZED)
      }
      const condition = { session: token }
      const checkJwt = await commonService.getByCondition(model.User, condition)
      // const checkJwt = await model.User.findOne({ session: token }).lean()
      if (!checkJwt) {
        return response.error(req, res, { msgCode: 'INVALID_TOKEN', token }, httpStatus.UNAUTHORIZED)
      } else {
        req.data = decoded
        return next()
      }
    })
  } catch (err) {
    console.log(err)
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
  }
}

exports.sessionIsValid = async (req, res, next) => {
  try {
    const isUser = await commonService.getByCondition(model.User, { email: req.data.email })
    if (!isUser) {
      unlinkFile(req)
      return response.error(req, res, { msgCode: 'INVALID_TOKEN' }, httpStatus.UNAUTHORIZED)
    }
    if (isUser.email !== req.data.email || req.data.tokenType !== constant.tokenType.LOGIN_TOKEN_TYPE) {
      unlinkFile(req)
      return response.error(req, res, { msgCode: 'UNAUTHORIZED', isUser }, httpStatus.UNAUTHORIZED)
    }
    req.user = isUser
    return next()
  } catch (error) {
    unlinkFile(req)
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
  }
}

// function to verify active user

exports.isActiveUser = async (req, res, next) => {
  try {
    const user = req.user
    if (user && user.role === constant.userType.USER) {
      if (user.status === constant.statusType.ACTIVE) {
        return next()
      } else if (user.status === constant.statusType.INACTIVE) {
        return res.success(req, res, { msgCode: 'Your account is inactive, Please contact admin!' }, httpStatus.UNAUTHORIZED)
      } else if (user.status === constant.statusType.PENDING) {
        return res.success(req, res, { msgCode: 'Your account is in pending state, Kindly wait or contact admin' }, httpStatus.UNAUTHORIZED)
      } else {
        return res.success(req, res, { msgCode: 'ACCOUNT DELETED' }, httpStatus.UNAUTHORIZED)
      }
    }
    return res.success(req, res, { msgCode: 'UNAUTHORIZED! ONLY ACTIVE USERS ALLOWED' }, httpStatus.UNAUTHORIZED)
  } catch (err) {
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
  }
}

// function to verify active roles(user, admin)

exports.isActive = async (req, res, next) => {
  try {
    const user = req.user
    if (user.status === constant.statusType.ACTIVE) {
      return next()
    } else if (user.status === constant.statusType.INACTIVE) {
      return res.success(req, res, { msgCode: 'Your account is inactive, Please contact admin!' }, httpStatus.UNAUTHORIZED)
    } else if (user.status === constant.statusType.PENDING) {
      return res.success(req, res, { msgCode: 'Your account is in pending state, Kindly wait or contact admin' }, httpStatus.UNAUTHORIZED)
    } else {
      return res.success(req, res, { msgCode: 'ACCOUNT DELETED' }, httpStatus.UNAUTHORIZED)
    }
  } catch (err) {
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
  }
}
exports.isAdmin = async (req, res, next) => {
  try {
    // check role
    if (req.user && req.user.role === constant.userType.ADMIN) {
      return next()
    } else {
      return response.error(req, res, { msgCode: 'UNAUTHORIZED! ONLY ADMIN ALLOWED' })
    }
  } catch (err) {
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
  }
}

exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.token
    if (!token) {
      return response.error(req, res, { msgCode: 'MISSING_TOKEN' }, httpStatus.UNAUTHORIZED)
    }
    jwt.verify(token, env.SECRET_KEY, async (error, decoded) => {
      console.log(error)
      if (error) {
        let msgCode = 'INVALID_TOKEN'
        if (error.message === constant.errorMsg.EXPIRED) {
          msgCode = 'TOKEN_EXPIRED'
        }
        return response.error(req, res, { msgCode }, httpStatus.UNAUTHORIZED)
      }
      req.token = decoded
      return next()
    })
  } catch (err) {
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
  }
}

exports.otpVerification = async (req, res, next) => {
  try {
    const otp = req.body.otp
    const user = await commonService.getByCondition(model.User, { session: req.headers.token })
    if (!user) { return response.error(req, res, { msgCode: 'UNAUTHORIZED' }, httpStatus.UNAUTHORIZED) }

    jwt.verify(user.session, env.SECRET_KEY, (error, decoded) => {
      if (error) {
        return response.error(req, res, { msgCode: 'INVALID TOKEN', error }, httpStatus.UNAUTHORIZED)
      }
      if (otp !== decoded.otp || decoded.tokenType !== constant.tokenType.FORGOT_TOKEN_TYPE) {
        return response.error(req, res, { msgCode: 'OTP DID NOT MATCH' }, httpStatus.UNAUTHORIZED)
      }
      req.email = user.email
      next()
    })
  } catch (error) {
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
  }
}

exports.resetTokenVerification = async (req, res, next) => {
  const user = commonService.getByCondition(model.User, { session: req.headers.token })
  if (!user) return response.error(req, res, { msgCode: 'UNAUTHORIZED' }, httpStatus.UNAUTHORIZED)
  jwt.verify(user.session, env.SECRET_KEY, (error, decoded) => {
    if (error) {
      return response.error(req, res, { msgCode: 'INVALID TOKEN' }, httpStatus.UNAUTHORIZED)
    }
    if (decoded.tokenType !== constant.tokenType.RESET_TOKEN_TYPE) {
      return response.error(req, res, { msgCode: 'INVALID TOKEN' }, httpStatus.EXPIRED)
    }
    req.email = user.email
    return next()
  })
}

exports.signupValidator = async (req, res, next) => {
  try {
    const { error } = signUpSchema.validate(req.body)
    if (error) {
      unlinkFile(req)
      return response.error(req, res, { data: error }, httpStatus.BAD_REQUEST)
    }
    next()
  } catch (error) {
    unlinkFile(req)
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
  }
}

exports.loginValidator = async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body)
    if (error) {
      return response.error(req, res, { data: error }, httpStatus.BAD_REQUEST)
    }
    next()
  } catch (error) {
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
  }
}

exports.checkDuplicateEmail = async (req, res, next) => {
  try {
    const condition = { email: req.body.email }
    const isDuplicateEmail = await commonService.getByCondition(model.User, condition)
    if (isDuplicateEmail) {
      unlinkFile(req)
      return response.error(req, res, { msgCode: 'EMAIL ALREADY IN USE' }, httpStatus.UNAUTHORIZED)
    }
    return next()
  } catch (error) {
    unlinkFile(req)
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
  }
}

exports.checkDuplicatePhone = async (req, res, next) => {
  try {
    const condition = { phone: req.body.phone }
    const isDuplicatePhone = await commonService.getByCondition(model.User, condition)
    if (isDuplicatePhone) {
      unlinkFile(req)
      return response.error(req, res, { msgCode: 'Phone ALREADY IN USE' }, httpStatus.UNAUTHORIZED)
    }
    return next()
  } catch (error) {
    unlinkFile(req)
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
  }
}

exports.emailExists = async (req, res, next) => {
  try {
    const user = await commonService.getByCondition(model.User, { email: req.body.email })
    if (!user) {
      return response.error(req, res, { msgCode: 'USER NOT FOUND' }, httpStatus.UNAUTHORIZED)
    }
    req.user = user
    next()
  } catch (error) {
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
  }
}

exports.passwordIsValid = async (req, res, next) => {
  try {
    const user = await commonService.getByCondition(model.User, { email: req.body.email })
    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password)
    if (!passwordIsValid) {
      return response.error(req, res, { msgCode: 'PASSWORD NOT FOUND' }, httpStatus.UNAUTHORIZED)
    }
    next()
  } catch (error) {
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
  }
}

exports.userEmailExists = async (req, res, next) => {
  try {
    const user = await commonService.getByCondition(model.User, { email: req.body.email, role: constant.userType.USER })
    if (!user) {
      return response.error(req, res, { msgCode: 'USER NOT FOUND' }, httpStatus.UNAUTHORIZED)
    } else {
      req.changeUserStatus = user
      return next()
    }
  } catch (error) {
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
  }
}
