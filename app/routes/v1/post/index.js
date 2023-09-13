const { createPost, getAllPost, getOnePost, deleteOnePost, deleteAllPost, editPost } = require('../../../controller/user')
const { verifyApiKey, verifyAuthToken, sessionIsValid } = require('../../../middleware/auth')
const { uploadPostImage } = require('../../../middleware/uploadImages')

const router = require('express').Router()

router.post('/create-post', verifyApiKey, verifyAuthToken, uploadPostImage.single('postImage'), sessionIsValid, createPost)
router.get('/get-all-post', verifyApiKey, verifyAuthToken, sessionIsValid, getAllPost)
router.get('/get-post/:id', verifyApiKey, verifyAuthToken, sessionIsValid, getOnePost)
router.patch('/delete-post/:id', verifyApiKey, verifyAuthToken, sessionIsValid, deleteOnePost)
router.patch('/delete-all-post', verifyApiKey, verifyAuthToken, sessionIsValid, deleteAllPost)
router.put('/edit-post', verifyApiKey, verifyAuthToken, uploadPostImage.single('postImage'), sessionIsValid, editPost)
module.exports = router
