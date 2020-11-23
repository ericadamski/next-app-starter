import { Page, Col, Row, Input, Text, Button } from "@geist-ui/react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import firebase from "firebase"
import "firebase/auth"

import initFirebase from "lib/firebase"

initFirebase()

const BUTTON_ID = "sign-in-button"

export default function JoinPage() {
  const [loading, setLoading] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const { register, handleSubmit, errors } = useForm()

  useEffect(() => {
    if (typeof window !== undefined) {
      firebase.auth().useDeviceLanguage()
      window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
        BUTTON_ID,
        {
          size: "invisible",
          callback: (response) => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
            onSignInSubmit()
          },
        },
      )
    }
  }, [])

  const handleSignIn = handleSubmit(async (data) => {
    console.log(data)
    throw new Error("Not implemented")
    setLoading(true)
    firebase
      .auth()
      .signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
      .then(function (confirmationResult) {
        setVerificationSent(true)
        // SMS sent. Prompt user to type the code from the message, then sign the
        // user in with confirmationResult.confirm(code).
        window.confirmationResult = confirmationResult
      })
      .catch(function (error) {
        // Error; SMS not sent
        // ...
      })
      .finally(() => setLoading(false))
  })

  return (
    <Page>
      <Text h1>Join</Text>
      {verificationSent ? (
        <Row>
          <Input />
          <Button onClick={verify}>Verify</Button>
        </Row>
      ) : (
        <Row>
          <form onSubmit={handleSignIn}>
            <Input name="phoneNumber" type="tel" ref={register} />
            <Button htmlType="submit" id={BUTTON_ID} loading={loading}>
              Join now
            </Button>
          </form>
        </Row>
      )}
    </Page>
  )
}
