const nodemailer = require('nodemailer')

const sendEmail = async (sendTo) => {
  try {
    const mailTransporter = nodemailer.createTransport({
      // service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.NODEMAILER_AUTH_USER,
        pass: process.env.NODEMAILER_AUTH_PASSWORD
      }
    })
    const details = await mailTransporter.sendMail({
      from: process.env.NODEMAILER_AUTH_USER,
      to: sendTo,
      subject: 'OTP to reset password',
      text: `Youe OTP is ${process.env.BYPASS_OTP}`
    })
    return details
  } catch (error) {
    console.log(error, 'Error sending email')
  }
}

module.exports = sendEmail
