const app = require('express')()
const { verifyApiKey } = require('../../middleware/auth')

const swaggerRouterV1 = require('./swagger/index')
app.use('/', swaggerRouterV1)
app.use(verifyApiKey)
app.use('/auth', require('./auth'))
app.use('/user', require('./user'))
app.use('/post', require('./post'))
app.use('/admin', require('./admin'))
app.use(swaggerRouterV1)
module.exports = app
