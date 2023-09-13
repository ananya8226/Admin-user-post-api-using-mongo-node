
const env = {
  PORT: process.env.PORT,
  MONGODB_USER_URI: process.env.MONGO_URI,
  NODE_ENV: process.env.NODE_ENV,
  API_KEY: process.env.API_KEY,
  SECRET_KEY: process.env.SECRET_KEY,
  TOKEN_EXPIRES_IN: process.env.TOKEN_EXPIRES_IN,
  OTP_DIGIT: process.env.OTP_DIGIT,
  SALT_ROUND: process.env.SALT_ROUND,
  OTP_EXPIRES_IN: process.env.OTP_EXPIRES_IN,
  MAX_LOGIN_DEVICE: process.env.MAX_LOGIN_DEVICE,
  BYPASS_OTP: process.env.BYPASS_OTP
}

const serverType = {
  DEVELOPMENT: 'DEVELOPMENT',
  STAGE: 'STAGE',
  TEST: 'TEST',
  PRODUCTION: 'PRODUCTION'
}

module.exports = { env, serverType }
