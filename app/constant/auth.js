const userType = {
  USER: 'USER',
  ADMIN: 'ADMIN'
}

const userStatus = {
  BLOCK: 'block',
  UNBLOCK: 'unblock'
}

const errorMsg = {
  EXPIRED: 'jwt expired',
  INVALID: 'invalid signature'
}

const statusType = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DELETE: 'DELETE',
  PENDING: 'PENDING'
}

const adminData = {
  ADMIN_FULLNAME: 'ADMIN',
  ADMIN_EMAIL: 'ADMIN@GMAIL.COM',
  ADMIN_PASSWORD: 'ADMIN123'
}

const tokenType = {
  LOGIN_TOKEN_TYPE: 'LOGIN',
  RESET_TOKEN_TYPE: 'RESET_PASSWORD',
  FORGOT_TOKEN_TYPE: 'FORGET_PASSWORD'

}
module.exports = { userType, userStatus, errorMsg, statusType, adminData, tokenType }
