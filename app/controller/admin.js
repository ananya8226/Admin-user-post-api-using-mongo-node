const { adminData, statusType, userType, tokenType } = require('../constant/auth')
const bcrypt = require('bcrypt')
const response = require('../response/index')
const httpStatus = require('http-status')
const authJwt = require('../middleware')
const { User, Post } = require('../model/index')
const { env } = require('../constant/environment')
const commonService = require('../services/common')

exports.adminSignup = async (req, res) => {
  try {
    const admin = {
      fullname: adminData.ADMIN_FULLNAME,
      email: adminData.ADMIN_EMAIL,
      phone: null,
      status: statusType.ACTIVE,
      role: userType.ADMIN,
      password: bcrypt.hashSync(adminData.ADMIN_PASSWORD, 6)
    }
    const user = await commonService.create(User, admin)
    return response.success(req, res, user, httpStatus.OK)
  } catch (error) {
    console.log(error)
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.BAD_REQUEST)
  }
}

exports.adminLogin = async (req, res) => {
  try {
    const { email } = req.body
    const checkUser = await commonService.getByCondition(User, { email })
    const token = authJwt.generateAuthJwt({
      id: checkUser._id,
      expiresIn: env.TOKEN_EXPIRES_IN,
      email,
      tokenType: tokenType.LOGIN_TOKEN_TYPE,
      role: userType.ADMIN
    })
    if (!token) {
      return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
    }
    const admin = await commonService.updateByCondition(User, { email }, { session: token })
    return response.success(req, res, { msgCode: 'ADMIN LOGGED IN', admin }, httpStatus.OK)
  } catch (error) {
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.BAD_REQUEST)
  }
}

exports.changeUserStatus = async (req, res) => {
  try {
    const user = req.changeUserStatus
    if (user.status === req.body.status) {
      return response.error(req, res, { msgCode: 'SAME STATUS' }, httpStatus.BAD_REQUEST)
    }
    if (user.status === statusType.DELETE) {
      return response.error(req, res, { msgCode: 'CANNOT UPDATE STATUS OF DELETED USER' }, httpStatus.BAD_REQUEST)
    }
    if (req.body.status === statusType.PENDING) {
      return response.error(req, res, { msgCode: 'CANNOT SET STATUS TO PENDING' }, httpStatus.BAD_REQUEST)
    }
    if (req.body.status === statusType.ACTIVE) {
      await commonService.updateByCondition(User, { email: req.body.email }, { status: req.body.status })
    } else if (req.body.status === statusType.DELETE) {
      await commonService.updateByCondition(User, { email: req.body.email }, { status: req.body.status, session: null })
      await commonService.updateByCondition(Post, { userId: user._id }, { status: statusType.INACTIVE })
    } else {
      await commonService.updateByCondition(User, { email: req.body.email }, { status: req.body.status, session: null })
    }
    return response.success(req, res, { msgCode: 'USER STATUS UPDATED SUCCESSFULLY' }, httpStatus.OK)
  } catch (error) {
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.BAD_REQUEST)
  }
}

exports.changePostStatus = async (req, res) => {
  try {
    const post = await commonService.updateByCondition(Post, { _id: req.body.id }, { status: req.body.status })
    return response.success(req, res, { msgCode: 'POST STATUS UPDATED SUCCESSFULLY', post }, httpStatus.OK)
  } catch (error) {
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.BAD_REQUEST)
  }
}

exports.getPostList = async (req, res) => {
  try {
    let condition = null
    let { searchKey, searchValue, sort, order, limit, page } = req.query
    if (searchValue) {
      if (searchKey) {
        condition = {}
        condition[searchKey] = new RegExp(searchValue, 'i')
      } else {
        condition = {}
        condition.$or = [{ fullname: new RegExp(searchValue, 'i') }]
      }
    }
    const sortCondition = {}
    if (sort) sortCondition[sort] = order === 'asc' ? 1 : -1
    else sort = []
    const skip = (page - 1) * limit
    limit = limit ? parseInt(limit) : null
    const attr = { _id: 1, userId: 1, title: 1, image: 1, createdAt: 1 }
    const posts = await commonService.getManyByCondition(Post, condition, sortCondition, skip, limit, attr)
    if (!posts) {
      return response.error(req, res, { msgCode: 'ERROR FETCHING POSTS' }, httpStatus.BAD_REQUEST)
    }
    return response.success(req, res, { msgCode: 'ALL POSTS FETCHED SUCCESSFULLY', posts }, httpStatus.OK)
  } catch (error) {
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.BAD_REQUEST)
  }
}

exports.getUserList = async (req, res) => {
  try {
    const condition = {
      role: { $ne: userType.ADMIN }
    }
    let { searchKey, searchValue, sort, order, limit, page } = req.query
    if (searchValue) {
      if (searchKey) {
        condition[searchKey] = new RegExp(searchValue, 'i')
      } else {
        condition.$or = [{ fullname: new RegExp(searchValue, 'i') }]
      }
    }
    const sortCondition = {}
    if (sort) sortCondition[sort] = order === 'asc' ? 1 : -1
    else sort = []
    const skip = (page - 1) * limit
    limit = limit ? parseInt(limit) : null
    const attr = { _id: 1, fullname: 1, email: 1, phone: 1, status: 1 }
    const users = await commonService.getManyByCondition(User, condition, sortCondition, skip, limit, attr)
    if (!users) {
      return response.error(req, res, { msgCode: 'ERROR FETCHING USERS' }, httpStatus.BAD_REQUEST)
    }
    return response.success(req, res, { msgCode: 'ALL USERS FETCHED SUCCESSFULLY', users }, httpStatus.OK)
  } catch (error) {
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.BAD_REQUEST)
  }
}

exports.getUsersWithPost = async (req, res) => {
  try {
    let condition = null
    let { searchKey, searchValue, sort, order, limit, page } = req.query
    if (searchValue) {
      if (searchKey) {
        condition = {}
        condition[searchKey] = new RegExp(searchValue, 'i')
      } else {
        condition = {}
        condition.$or = [{ fullname: new RegExp(searchValue, 'i') }]
      }
    }
    const sortCondition = {}
    if (sort) sortCondition[sort] = order === 'asc' ? 1 : -1
    else sort = []
    const skip = (page - 1) * limit
    limit = limit ? parseInt(limit) : null
    const attr = { _id: 1, userId: 1, title: 1, image: 1 }
    const usersWithPost = await Post.find(condition, attr).populate('userId').sort(sortCondition).skip(skip).limit(limit).lean()
    if (!usersWithPost) {
      return response.error(req, res, { msgCode: 'ERROR FETCHING USERS' }, httpStatus.BAD_REQUEST)
    }
    return response.success(req, res, { msgCode: 'ALL USERS FETCHED SUCCESSFULLY', usersWithPost }, httpStatus.OK)
  } catch (error) {
    return response.error(req, res, { msgCode: 'INTERNAL_SERVER_ERROR' }, httpStatus.BAD_REQUEST)
  }
}
