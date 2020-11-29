import firebase from "lib/firebase"

import ensureAuth from "utils/ensureAuth"
import handlers from "utils/requestHandlers"
import NetworkError from "utils/networkError"

export default handlers.get(async (req, res) => {
  const { token } = req.body

  const user = ensureAuth(token)

  console.log(user)

  // possibly get all data related to user
  res.json(user)
})
