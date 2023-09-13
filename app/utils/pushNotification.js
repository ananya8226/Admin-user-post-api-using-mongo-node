
const FCM = require('fcm-node')
const { env } = require('../constant/environment')
const serverKey = env.FIRE_BASE_KEY || '' // put your server key here
const fcm = new FCM(serverKey)

const notificationPush = ({ token, title, description, pushType, notificationMeta }) => {
  const message = {
    registration_ids: token,
    notification: {
      title,
      body: description,
      badge: 1
    },
    content_available: true,
    data: {
      title,
      body: description,
      badge: 1,
      pushType,
      data: notificationMeta
    }
  }
  sendNotification(message).then(() => {

  })
}

const notificationPushSingle = ({ token, title, description }) => {
  const message = {
    to: token,
    notification: {
      title,
      body: description,
      badge: 1
    },
    content_available: true,
    data: {
      title,
      body: description,
      badge: 1,
      pushType: 1
    }
  }
  sendNotification(message).then(() => {

  })
}

function sendNotification (message) {
  return new Promise((resolve, reject) => {
    console.log(message)
    fcm.send(message, (err, response) => {
      if (err) {
        console.log('Something has gone wrong!', err)
      } else {
        console.log('Successfully sent with response: ', response)
        resolve()
      }
    })
  })
}

module.exports = {
  notificationPush,
  notificationPushSingle
}
