const httpStatus = require('http-status')
const response = require('../response/index')
const model = require('../model/index')
const bcrypt = require('bcrypt')
const constant = require('../constant/auth')
const commonService = require('../services/common')

exports.userIsValid = async (req, res, next) => {
  try {
    const isUser = await commonService.getByCondition(model.User, { email: req.data.email })
    if (!isUser) { return response.error(req, res, { msgCode: 'INVALID TOKEN' }, httpStatus.UNAUTHORIZED) }
    if (req.data.email !== isUser.email && req.data.tokenType === constant.tokenType.LOGIN) {
      return response.error(req, res, { msgCode: 'UNAUTHORIZED' }, httpStatus.UNAUTHORIZED)
    }
    const passwordMatch = bcrypt.compareSync(req.body.password, isUser.password)
    if (!passwordMatch) {
      return response.error(req, res, { msgCode: 'INVALID PASSWORD' }, httpStatus.UNAUTHORIZED)
    }
    req.user = isUser
    return next()
  } catch (error) {
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
  }
}

exports.postExists = async (req, res, next) => {
  try {
    const post = await commonService.getByCondition(model.Post, { _id: req.body.id })
    if (!post) {
      return response.error(req, res, { msgCode: 'POST DOES NOT EXIST' }, httpStatus.BAD_REQUEST)
    }
    return next()
  } catch (error) {
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
  }
}

exports.verifyFollowing = async (req, res, next) => {
  try {
    const following = await commonService.getByCondition(model.User, { _id: req.body.id, status: constant.statusType.ACTIVE })
    if (!following) {
      return response.error(req, res, { msgCode: 'USER NOT FOUND' }, httpStatus.NOT_FOUND)
    }
    console.log(following._id.toString(), req.user._id.toString())
    if (following._id.toString() === req.user._id.toString()) {
      return response.error(req, res, { msgCode: 'FOLLOWER AND FOLLOWING ARE SAME' }, httpStatus.EXPECTATION_FAILED)
    }
    return next()
  } catch (error) {
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
  }
}
