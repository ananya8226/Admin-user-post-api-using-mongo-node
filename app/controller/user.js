const bcrypt = require('bcrypt')
const response = require('../response/index')
const httpStatus = require('http-status')
const { User, Follower, Post } = require('../model/index')
const commonService = require('../services/common')
const { statusType, userType } = require('../constant/auth')
const { unlinkFile } = require('../utils/helper')

exports.changePassword = async (req, res) => {
  try {
    const newPassword = bcrypt.hashSync(req.body.newPassword, 6)
    const user = await commonService.updateByCondition(User, { email: req.data.email }, { password: newPassword })
    return response.success(req, res, { msgCode: 'PASSWORD CHANGED SUCCESSFULLY', user }, httpStatus.OK)
  } catch (error) {
    return response.error(req, res, { msgCode: 'INTERNAL SERVER ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
  }
}

exports.getUserDetails = async (req, res) => {
  try {
    const { fullname, phone, email, profileImage } = req.user
    const data = { fullname, phone, email, profileImage }
    return response.success(req, res, { msgCode: 'USER DETAILS FETCHED SUCCESSFULLY', data }, httpStatus.OK)
  } catch (error) {
    return response.error(req, res, { msgCode: 'INTERNAL SERVER ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
  }
}

exports.editUserDetails = async (req, res) => {
  try {
    const { fullname, phone, email } = req.body
    await commonService.updateByCondition(User, { email: req.user.email }, { fullname, phone, email })
    if (req.file) {
      await commonService.updateByCondition(User, { email: req.user.email }, { profileImage: req.file?.path })
    }
    return response.success(req, res, { msgCode: 'USER DETAILS UPDATED SUCCESSFULLY' }, httpStatus.OK)
  } catch (error) {
    return response.error(req, res, { msgCode: 'INTERNAL SERVER ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
  }
}

exports.getAllUser = async (req, res) => {
  try {
    const followingIds = await Follower.find({ followerId: req.user._id }).distinct('followingId').lean()
    const condition = { _id: { $nin: [...followingIds, req.user._id] }, status: statusType.ACTIVE, role: userType.USER } // exclude users which user is already following
    let { searchKey, searchValue, sort, order, limit, page } = req.query
    if (searchValue) {
      if (searchKey) {
        condition[searchKey] = new RegExp(searchValue, 'i')
      } else {
        condition.$or = [{ fullname: new RegExp(searchValue, 'i') }, { email: new RegExp(searchValue, 'i') }]
      }
    }
    const sortCondition = {}
    if (sort) sortCondition[sort] = order === 'asc' ? 1 : -1
    else sort = []
    const skip = (page - 1) * limit
    limit = limit ? parseInt(limit) : null
    const attr = { _id: 1, fullname: 1, email: 1, phone: 1 }
    const users = await commonService.getManyByCondition(User, condition, sortCondition, skip, limit, attr)
    return response.success(req, res, { msgCode: 'USERS FETCHED SUCCESSFULLY', users }, httpStatus.OK)
  } catch (error) {
    return response.error(req, res, { msgCode: 'INTERNAL SERVER ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
  }
}

exports.follow = async (req, res) => {
  try {
    const followerId = req.data.id
    const followingId = req.body.id
    const condition = { followerId, followingId }
    const alreadyFollows = await commonService.getByCondition(Follower, condition)
    if (!alreadyFollows) {
      const entry = await commonService.create(Follower, condition)
      return response.success(req, res, { msgcode: `YOU FOLLOWED ${followingId}`, entry }, httpStatus.OK)
    } else {
      await commonService.deleteByField(Follower, condition)
      return response.success(req, res, { msgCode: `YOU UNFOLLOWED ${followingId}` }, httpStatus.OK)
    }
  } catch (error) {
    return response.error(req, res, { msgCode: 'INTERNAL SERVER ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
  }
}

// exports.getFollower = async (req, res) => {
//   try {
//     const followerIds = await Follower.find({ followingId: req.user._id }).distinct('followerId').lean()
//     const condition = { _id: { $in: followerIds } }
//     let { searchKey, searchValue, sort, order, limit, page } = req.query
//     if (searchValue) {
//       if (searchKey) {
//         condition[searchKey] = new RegExp(searchValue, 'i')
//       } else {
//         condition.$or = [{ fullname: new RegExp(searchValue, 'i') }, { email: new RegExp(searchValue, 'i') }]
//       }
//     }
//     const sortCondition = {}
//     if (sort) sortCondition[sort] = order === 'asc' ? 1 : -1
//     else sort = []
//     const skip = (page - 1) * limit
//     limit = limit ? parseInt(limit) : null
//     const attr = { _id: 1, fullname: 1, email: 1, phone: 1 }
//     const followerList = await commonService.getManyByCondition(User, condition, sortCondition, skip, limit, attr)
//     return response.success(req, res, { msgCode: 'FOLLOWING LIST FETCHED SUCCESSFULLY', followerList }, httpStatus.OK)
//   } catch (error) {
//     return response.error(req, res, { msgCode: 'INTERNAL SERVER ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
//   }
// }

exports.getFollower = async (req, res) => {
  try {
    const { searchKey, searchValue, sort, limit, page } = req.query
    const order = req.query.order || -1
    const sortCondition = {
      [(sort === '') ? 'fullname' : sort]: order
    }
    // if (sort) sortCondition[sort] = order === 'asc' ? 1 : -1
    // else sort = {[]}
    const followers = await Follower.aggregate([
      { $match: { followingId: req.user._id } },
      {
        $lookup: {
          from: 'users',
          localField: 'followerId',
          foreignField: '_id',
          pipeline: [{
            $project: { fullname: 1, email: 1, phone: 1 }
          }],
          as: 'Following'
        }
      },
      {
        $sort: sortCondition
      }
    ])
    return response.success(req, res, { msgCode: 'Success', followers }, httpStatus.OK)
  } catch (error) {
    console.log(error)
    return response.error(req, res, { msgCode: 'INTERNAL SERVER ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
  }
}

exports.getFollowing = async (req, res) => {
  try {
    const followingIds = await Follower.find({ followerId: req.user._id }).distinct('followingId').lean()
    const condition = { _id: { $in: followingIds } }
    let { searchKey, searchValue, sort, order, limit, page } = req.query
    if (searchValue) {
      if (searchKey) {
        condition[searchKey] = new RegExp(searchValue, 'i')
      } else {
        condition.$or = [{ fullname: new RegExp(searchValue, 'i') }, { email: new RegExp(searchValue, 'i') }]
      }
    }
    const sortCondition = {}
    if (sort) sortCondition[sort] = order === 'asc' ? 1 : -1
    else sort = []
    const skip = (page - 1) * limit
    limit = limit ? parseInt(limit) : null
    const attr = { _id: 1, fullname: 1, email: 1, phone: 1 }
    const followingList = await commonService.getManyByCondition(User, condition, sortCondition, skip, limit, attr)
    return response.success(req, res, { msgCode: 'FOLLOWING LIST FETCHED SUCCESSFULLY', followingList }, httpStatus.OK)
  } catch (error) {
    return response.error(req, res, { msgCode: 'INTERNAL SERVER ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
  }
}

exports.getFollowingPosts = async (req, res) => {
  try {
    const followingIds = await Follower.find({ followerId: req.user._id }).distinct('followingId').lean()
    const userAttr = { _id: 1, fullname: 1, email: 1, phone: 1 }
    const usersDetails = await commonService.getMany(User, { _id: { $in: followingIds } }, userAttr)
    const postCondition = { userId: { $in: followingIds }, status: statusType.ACTIVE }
    const attr = { _id: 1, title: 1, userId: 1 }
    const posts = await Post.find(postCondition, attr).populate('userId')
    const userDetailsWithPosts = await usersDetails.map((user) => {
      const userPosts = posts.filter((post) => post.userId.equals(user._id))
      return { user, posts: userPosts }
    })

    return response.success(req, res, { msgCode: 'FOLLOWING LIST WITH POSTS FETCHED SUCCESSFULLY', userDetailsWithPosts }, httpStatus.OK)
  } catch (error) {
    return response.error(req, res, { msgCode: 'INTERNAL SERVER ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
  }
}

exports.getPostsWithUser = async (req, res) => {
  try {
    const followingIds = await Follower.find({ followerId: req.user._id }).distinct('followingId').lean()
    const postCondition = { userId: { $in: followingIds }, status: statusType.ACTIVE }
    const attr = { _id: 1, title: 1, userId: 1 }
    const posts = await Post.find(postCondition, attr).populate('userId')
    return response.success(req, res, { msgCode: 'FOLLOWING LIST WITH POSTS FETCHED SUCCESSFULLY', posts }, httpStatus.OK)
  } catch (error) {
    return response.error(req, res, { msgCode: 'INTERNAL SERVER ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
  }
}

exports.createPost = async (req, res) => {
  try {
    const { title } = req.body
    const userId = req.user._id
    const latestPost = await Post.find({ userId }).sort({ createdAt: -1 })
    if (latestPost && Date.now() - latestPost.createdAt < 36000) {
      unlinkFile(req)
      return response.error(req, res, { msgCode: 'Cannot post before 10 minutes from your latest post' }, httpStatus.EXPECTATION_FAILED)
    }
    const post = await commonService.create(Post, { title, userId })
    if (!post) {
      unlinkFile(req)
      return response.error(req, res, { msgCode: 'ERROR CREATING POST' }, httpStatus.INTERNAL_SERVER_ERROR)
    }
    return response.success(req, res, { msgCode: 'POST CREATED SUCCESSFULLY', post }, httpStatus.OK)
  } catch (error) {
    unlinkFile(req)
    return response.error(req, res, { msgCode: 'INTERNAL SERVER ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
  }
}

exports.getAllPost = async (req, res) => {
  try {
    const userId = req.user._id
    const condition = { userId, status: statusType.ACTIVE }
    let { searchKey, searchValue, sort, order, limit, page } = req.query
    if (searchValue) {
      if (searchKey) {
        condition[searchKey] = new RegExp(searchValue, 'i')
      } else {
        condition.$or = [{ fullname: new RegExp(searchValue, 'i') }, { email: new RegExp(searchValue, 'i') }]
      }
    }
    const sortCondition = {}
    if (sort) sortCondition[sort] = order === 'asc' ? 1 : -1
    else sort = []
    const skip = (page - 1) * limit
    limit = limit ? parseInt(limit) : null
    const attr = { _id: 1, userId: 1, title: 1, createdAt: 1, image: 1 }
    const posts = await commonService.getManyByCondition(Post, condition, sortCondition, skip, limit, attr)
    return response.success(req, res, { msgCode: 'ALL POSTS FETCHED SUCCESSFULLY', posts }, httpStatus.OK)
  } catch (error) {
    return response.error(req, res, { msgCode: 'INTERNAL SERVER ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
  }
}

exports.getOnePost = async (req, res) => {
  try {
    const userId = req.user._id
    const postId = req.params.id
    const post = await commonService.getByCondition(Post, { userId, _id: postId, status: statusType.ACTIVE })
    if (!post) {
      return response.error(req, res, { msgCode: 'POST DOES NOT EXIST' }, httpStatus.EXPECTATION_FAILED)
    }
    return response.success(req, res, { msgCode: 'POST FETCHED SUCCESSFULLY', post }, httpStatus.OK)
  } catch (error) {
    return response.error(req, res, { msgCode: 'INTERNAL SERVER ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
  }
}

exports.deleteOnePost = async (req, res) => {
  try {
    const userId = req.user._id
    const postId = req.params.id
    const post = await commonService.updateByCondition(Post, { userId, _id: postId, status: statusType.ACTIVE }, { status: statusType.INACTIVE })
    if (!post) {
      return response.error(req, res, { msgCode: 'POST DOES NOT EXIST', post }, httpStatus.EXPECTATION_FAILED)
    }
    return response.success(req, res, { msgCode: 'POST DELETED SUCCESSFULLY', post }, httpStatus.OK)
  } catch (error) {
    return response.error(req, res, { msgCode: 'INTERNAL SERVER ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
  }
}

exports.deleteAllPost = async (req, res) => {
  try {
    const userId = req.user._id
    const posts = await commonService.updateManyByCondition(Post, { userId }, { status: statusType.INACTIVE })
    if (!posts) {
      return response.error(req, res, { msgCode: 'POSTS DO NOT EXIST' }, httpStatus.EXPECTATION_FAILED)
    }
    return response.success(req, res, { msgCode: 'ALL POSTS DELETED' }, httpStatus.OK)
  } catch (error) {
    return response.error(req, res, { msgCode: 'INTERNAL SERVER ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
  }
}

exports.editPost = async (req, res) => {
  try {
    const userId = req.user._id
    const postId = req.params.id
    const editedPost = {} // creating this object to update only those fields which are present in request.
    if (req.body.title) {
      editedPost.title = req.body.title
    }
    if (req.file?.path) {
      editedPost.image = req.file?.path
    }
    const updatedPost = await commonService.updateByCondition(Post, { userId, _id: postId, status: statusType.ACTIVE }, editedPost)
    if (!updatedPost) {
      return response.error(req, res, { msgCode: 'POST DOES NOT EXIST' }, httpStatus.EXPECTATION_FAILED)
    }
    return response.success(req, res, { msgCode: 'POST UPDATED SUCCESSFULLY', updatedPost }, httpStatus.OK)
  } catch (error) {
    return response.error(req, res, { msgCode: 'INTERNAL SERVER ERROR' }, httpStatus.INTERNAL_SERVER_ERROR)
  }
}
