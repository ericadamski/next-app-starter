import firebase from "lib/firebase-admin"
import log from "./log"
import NetworkError from "./networkError"

export default async function ensureAuth(idToken) {
  try {
    const user = await firebase.auth().verifyIdToken(idToken)

    return user
  } catch (error) {
    log.error(error)
    throw new NetworkError(401)
  }
}
