import firebase from "lib/firebase-admin";
import ensureHttpMethod, { METHODS } from "utils/ensureHttpMethod";
import NetworkError from "utils/networkError";

let db;

if (!db) db = firebase.firestore();

export default async function SaveUser(req, res) {
  try {
    ensureHttpMethod(req, METHODS.POST);

    const { user } = req.body;

    if (!user) {
      throw new NetworkError(400);
    }

    const userDocument = await db.collection("users").doc(user.id).get();

    if (!userDocument.exists) {
      await db.collection("users").doc(user.id).set(user);
    }

    return res.end();
  } catch (error) {
    res.status(error.code ?? 500).end(error.message);
  }
}
