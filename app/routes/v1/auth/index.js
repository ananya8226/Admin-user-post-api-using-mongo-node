const router = require('express').Router()
const userController = require('../../../controller/auth')
const { changePassword } = require('../../../controller/user')
const { checkDuplicateEmail, checkDuplicatePhone, signupValidator, emailExists, isActive, otpVerification, resetTokenVerification, verifyAuthToken, verifyApiKey } = require('../../../middleware/auth')
const { uploadProfileImage } = require('../../../middleware/uploadImages')
const { userIsValid } = require('../../../middleware/user')

router.post('/signup', uploadProfileImage.single('profileImage'), signupValidator, checkDuplicateEmail, checkDuplicatePhone, userController.signup)
// router.post('/adminSignup', adminController.adminSignup);
router.patch('/change-password', verifyApiKey, verifyAuthToken, userIsValid, changePassword)
router.post('/forgot-password', emailExists, isActive, userController.forgotPassword)
router.post('/verify-otp', otpVerification, userController.verifyOtp)
router.post('/reset-password', resetTokenVerification, userController.resetPassword)
module.exports = router
