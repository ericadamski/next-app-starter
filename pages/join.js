import { Page, Col, Row, Input, Text, Button } from "@geist-ui/react"
import { useRef, useEffect, useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import firebase from "firebase"
import "firebase/auth"
import parsePhoneNumber from "libphonenumber-js"

import initFirebase from "lib/firebase"

initFirebase()

const provider = new firebase.auth.PhoneAuthProvider()

const BUTTON_ID = "sign-in-button"

let COUNTRY

export default function JoinPage() {
  const recaptcha = useRef(null)
  const [loading, setLoading] = useState(false)
  const [verificationId, setVerificationId] = useState()
  const {
    watch,
    handleSubmit,
    errors,
    setValue,
    register,
    reset,
    getValues,
  } = useForm()

  console.log(verificationId)
  console.count("render")

  const pnChange = watch("phoneNumber")

  useEffect(() => {
    if (pnChange) {
      let pn
      if ((pn = parsePhoneNumber(pnChange, COUNTRY)?.formatNational())) {
        setValue("phoneNumber", pn)
      }
    }
  }, [pnChange, COUNTRY])

  const handleSignIn = useCallback(
    async ({ phoneNumber }) => {
      setLoading(true)

      const n = parsePhoneNumber(phoneNumber, COUNTRY)?.number

      if (!n) {
        // This should never happen otherwise the form validation
        // failed and ths was still allowed to run
        throw new Error(`Invalid phone number`)
      }

      try {
        setVerificationId(
          await provider.verifyPhoneNumber(n, recaptcha?.current),
        )
        reset()
      } catch (error) {
        // reset recaptcha
        grecaptcha.reset(await recaptcha.current?.render())
      } finally {
        setLoading(false)
      }
    },
    [recaptcha],
  )

  const handleValidate = useCallback(
    (value) => Boolean(parsePhoneNumber(value, COUNTRY)?.isValid()),
    [COUNTRY],
  )

  const verify = useCallback(
    async ({ code }) => {
      console.log({ verificationId })
      setLoading(true)

      try {
        const creds = await firebase.auth.PhoneAuthProvider.credential(
          verificationId,
          code,
        )

        console.log({ creds })

        const user = await firebase.auth().signInWithCredential(creds)

        console.log(user)
      } catch (error) {
        console.error("there was an error validating the code", error, code)
      } finally {
        setLoading(false)
      }
    },
    [verificationId],
  )

  const handleFormSubmit = useCallback(
    (data) => {
      console.log({ data })
      if (data.code) {
        verify(data)
      } else {
        handleSignIn(data)
      }
    },
    [verify, handleSignIn],
  )

  useEffect(() => {
    if (typeof window !== undefined && !recaptcha.current) {
      COUNTRY = navigator.language?.split("-").pop()

      firebase.auth().useDeviceLanguage()
      recaptcha.current = new firebase.auth.RecaptchaVerifier(BUTTON_ID, {
        size: "invisible",
      })
    }
  }, [])

  return (
    <Page>
      <Text h1>Join</Text>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        {verificationId ? (
          <Input
            name="code"
            placeholder="Code"
            ref={register({ required: true })}
          />
        ) : (
          <Input
            name="phoneNumber"
            placeholder="Phone Number"
            type="tel"
            status={errors.phoneNumber && "error"}
            ref={register({
              required: true,
              validate: handleValidate,
            })}
          />
        )}
        <Button htmlType="submit" id={BUTTON_ID} loading={loading}>
          {verificationId ? "Verify" : "Join now"}
        </Button>
      </form>
    </Page>
  )
}
