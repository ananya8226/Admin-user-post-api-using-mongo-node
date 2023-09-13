const Twilio = require('twilio')
require('dotenv').config()
const accountSid = process.env.ACCOUNT_SID
const authToken = process.env.AUTHTOKEN

const client = new Twilio(accountSid, authToken)

const sendSms = async (sendTo) => {
  try {
    const message = await client.messages.create({
      body: `Your OTP is ${process.env.BYPASS_OTP}`,
      to: sendTo,
      from: '+17853228998'
    })
    console.log(message)
    console.log(process.env.ACCOUNT_SID, process.env.AUTHTOKEN)
  } catch (error) {
    console.log('Error sending SMS', error)
  }
}

module.exports = sendSms
