import UserError from "utils/userError"

export const SMSVerification = {
  async verify(phoneNumber, code, verificationId) {
    const request = await postJson("/api/verification/verify", {
      to: phoneNumber,
      code,
      verificationId,
    })

    if (request.ok) {
      return true
    }

    // TODO rethrow error from server?

    return false
  },
  async request(phoneNumber, channel) {
    if (channel != null && !["sms", "voice", "email"].includes(channel)) {
      throw new UserError(
        "Invalid channel",
        `Cannot request verification from channel ${channel}`,
      )
    }

    if (!phoneNumber) {
      throw new UserError(
        "Missing phone number",
        "Please enter a valid phone number.",
      )
    }

    const request = await postJson("/api/verification/request", {
      to: phoneNumber,
      channel,
    })

    if (request.ok) {
      return (await request.json()).sid
    }

    // TODO rethrow error from server?

    return undefined
  },
}

function postJson(route, body, options = {}) {
  return fetch(route, {
    ...options,
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  })
}
