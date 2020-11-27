import { Page, Col, Row, Input, Text, Button, useToasts } from "@geist-ui/react"
import { useRef, useEffect, useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import parsePhoneNumber from "libphonenumber-js"

import { SMSVerification } from "lib/api"
import UserError from "utils/userError"

let COUNTRY

export default function JoinPage() {
  const [verificationId, setVerificationId] = useState(null)
  const [to, setTo] = useState(null)
  const [_, setToast] = useToasts()
  const [loading, setLoading] = useState(false)
  const {
    watch,
    handleSubmit,
    errors,
    setValue,
    register,
    reset,
    getValues,
  } = useForm()

  const pnChange = watch("phoneNumber")

  const handleError = useCallback(
    (error) => {
      console.log(error)
      if (error instanceof UserError) {
        setToast({
          type: "warning",
          delay: 3000,
          text: `${error.title}
      ${error.message}`,
        })
      } else {
        setToast({
          type: "error",
          text: `Something when wrong`,
          delay: Infinity,
          actions: [
            { name: "Refresh", handler: () => window.location.reload() },
          ],
        })
      }
    },
    [setToast],
  )

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

      try {
        const n = parsePhoneNumber(phoneNumber, COUNTRY)?.number

        if (!n) {
          // This should never happen otherwise the form validation
          // failed and ths was still allowed to run
          throw new UserError(`Invalid phone number`)
        }

        setTo(n)
        setVerificationId(await SMSVerification.request(n))
        reset()
      } catch (error) {
        handleError(error)
      } finally {
        setLoading(false)
      }
    },
    [setVerificationId, setLoading, handleError],
  )

  const handleValidate = useCallback(
    (value) => Boolean(parsePhoneNumber(value, COUNTRY)?.isValid()),
    [COUNTRY],
  )

  const verify = useCallback(
    async ({ code }) => {
      setLoading(true)

      try {
        const valid = await SMSVerification.verify(to, code, verificationId)

        if (valid) {
          // create user in FB with pn, uuid, verified = true
          console.log("verified")
        }
      } catch (error) {
        handleError(error)
      } finally {
        setLoading(false)
      }
    },
    [verificationId, setLoading, handleError, to],
  )

  const handleFormSubmit = useCallback(
    (data) => {
      if (data.code) {
        verify(data)
      } else {
        handleSignIn(data)
      }
    },
    [verify, handleSignIn],
  )

  useEffect(() => {
    if (typeof window !== undefined) {
      COUNTRY = navigator.language?.split("-").pop()
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
        <Button htmlType="submit" loading={loading}>
          {verificationId ? "Verify" : "Join now"}
        </Button>
      </form>
    </Page>
  )
}