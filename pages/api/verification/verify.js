import Twilio from "twilio"

import ensureHttpMethod, { METHODS } from "utils/ensureHttpMethod"
import NetworkError from "utils/networkError"

let client

export default async (req, res) => {
  try {
    ensureHttpMethod(req, METHODS.POST)

    if (!client) {
      client = Twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
      )
    }

    const { to, code } = req.body

    if (!to || !code) {
      throw new NetworkError(400)
    }

    const verification = await client.verify
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({ to, code })

    if (verification.status !== "approved") {
      throw new NetworkError(401)
    }

    res.end()
  } catch (error) {
    console.log(error)
    res
      .status(error instanceof NetworkError ? error.code : 500)
      .end(error.message)
  }
}
