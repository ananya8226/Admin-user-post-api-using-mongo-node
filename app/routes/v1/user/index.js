const { logout, login } = require('../../../controller/auth')
const { changePassword, getUserDetails, editUserDetails, follow, getFollowing, getFollower, getFollowingPosts, getAllUser, getPostsWithUser } = require('../../../controller/user')
const { verifyAuthToken } = require('../../../middleware')
const { verifyApiKey, isActiveUser, sessionIsValid, emailExists, passwordIsValid, loginValidator } = require('../../../middleware/auth')
const { uploadProfileImage } = require('../../../middleware/uploadImages')
const { userIsValid, verifyFollowing } = require('../../../middleware/user')

const router = require('express').Router()

router.patch('/login', verifyApiKey, emailExists, passwordIsValid, loginValidator, isActiveUser, login)
router.patch('/change-password', verifyApiKey, verifyAuthToken, userIsValid, isActiveUser, changePassword)
router.patch('/logout', verifyApiKey, verifyAuthToken, sessionIsValid, isActiveUser, logout)
router.get('/get-user-detail', verifyApiKey, verifyAuthToken, sessionIsValid, isActiveUser, getUserDetails)
router.get('/get-all-user', verifyApiKey, verifyAuthToken, sessionIsValid, isActiveUser, getAllUser)
router.patch('/edit-user-detail', verifyApiKey, verifyAuthToken, uploadProfileImage.single('profileImage'), sessionIsValid, isActiveUser, editUserDetails)
router.post('/follow', verifyApiKey, verifyAuthToken, sessionIsValid, isActiveUser, verifyFollowing, follow)
router.post('/unfollow', verifyApiKey, verifyAuthToken, sessionIsValid, isActiveUser, verifyFollowing, follow)
router.get('/get-following', verifyApiKey, verifyAuthToken, sessionIsValid, isActiveUser, getFollowing)
router.get('/get-follower', verifyApiKey, verifyAuthToken, sessionIsValid, isActiveUser, getFollower)
router.get('/get-following-posts', verifyApiKey, verifyAuthToken, sessionIsValid, isActiveUser, getFollowingPosts)
router.get('/get-posts-with-user', verifyApiKey, verifyAuthToken, sessionIsValid, isActiveUser, getPostsWithUser)
module.exports = router
