import { v4 as uuidv4 } from "uuid"

import firebase from "lib/firebase-admin"
import handlers from "utils/requestHandlers"

import NetworkError from "utils/networkError"

let db

export default handlers.post(async (req, res) => {
  const { phoneNumber, name } = req.body

  // TODO: use YUP to validate params
  if (phoneNumber == null || name == null) {
    throw new NetworkError(400)
  }

  const uid = uuidv4()

  if (!db) {
    db = firebase.firestore()
  }

  const user = await db.collection("users").doc(phoneNumber).get()

  if (user.exists) {
    return res.end(await firebase.auth().createCustomToken(user.data().uid))
  }

  await db.collection("users").doc(phoneNumber).set({
    uid,
    phoneNumber,
    name,
  })

  // TODO: handle additionalClaims for admin/premium

  return res.end(await firebase.auth().createCustomToken(uid))
})
