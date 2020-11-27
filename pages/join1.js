import { Page, Col, Row, Input, Text, Button } from "@geist-ui/react"
import { useRef, useEffect, useState, useCallback, useReducer } from "react"
import firebase from "firebase"
import "firebase/auth"
import parsePhoneNumber from "libphonenumber-js"

import initFirebase from "lib/firebase"

initFirebase()

const provider = new firebase.auth.PhoneAuthProvider()

const BUTTON_ID = "sign-in-button"

let COUNTRY

const INITIAL_STATE = {
  loading: false,
  verificationId: undefined,
  values: {
    phoneNumber: "",
    code: "",
  },
  errors: {
    phoneNumber: undefined,
    code: undefined,
  },
}

const ACTIONS = {
  ERROR: "error",
  ERROR_CLEAR: "error_clear",
  EDIT: "edit",
  LOADING: "loading",
  VERIFICATION_ID: "verificationId",
}

function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.LOADING: {
      return {
        ...state,
        loading: action.loading,
      }
    }
    case ACTIONS.VERIFICATION_ID: {
      return {
        ...state,
        verificationId: action.value,
      }
    }
    case ACTIONS.EDIT: {
      return {
        ...state,
        values: { ...state.values, [action.fieldName]: action.value },
      }
    }
    case ACTIONS.ERROR_CLEAR: {
      return { ...state, errors: {} }
    }
    case ACTIONS.ERROR: {
      return {
        ...state,
        errors: { ...state.errors, [action.fieldName]: action.message },
      }
    }
  }

  return state
}

export default function JoinPage() {
  const recaptcha = useRef(null)
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  useEffect(() => {
    if (typeof window !== undefined && !recaptcha.current) {
      COUNTRY = navigator.language?.split("-").pop()

      firebase.auth().useDeviceLanguage()
      recaptcha.current = new firebase.auth.RecaptchaVerifier(BUTTON_ID, {
        size: "invisible",
      })
    }
  }, [])

  const setLoading = useCallback(
    (value) => dispatch({ type: ACTIONS.LOADING, loading: value }),
    [],
  )

  const setVerificationId = useCallback(
    (value) => dispatch({ type: ACTIONS.VERIFICATION_ID, value }),
    [],
  )

  const handleSignIn = useCallback(
    async ({ phoneNumber }) => {
      setLoading(true)

      try {
        setVerificationId(
          await provider.verifyPhoneNumber(phoneNumber, recaptcha?.current),
        )
      } catch (error) {
        // reset recaptcha
        // grecaptcha.reset(await recaptcha.current?.render())
        console.log(error)
      } finally {
        setLoading(false)
      }
    },
    [recaptcha],
  )

  // const handleValidate = useCallback(
  //   (value) => Boolean(parsePhoneNumber(value, COUNTRY)?.isValid()),
  //   [COUNTRY],
  // )

  const verify = useCallback(
    async ({ code }) => {
      console.log({ code, vid: state.verificationId })
      setLoading(true)

      try {
        const creds = await firebase.auth.PhoneAuthProvider.credential(
          state.verificationId,
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
    [state.verificationId],
  )

  const setError = useCallback(
    (fieldName, message) => {
      dispatch({ type: ACTIONS.ERROR, fieldName, message })
    },
    [dispatch],
  )

  const edit = useCallback(
    (fieldName) => {
      return (event) => {
        const { target } = event

        dispatch({ type: ACTIONS.EDIT, fieldName, value: target.value })
      }
    },
    [dispatch],
  )

  const handleFormSubmit = useCallback(
    (event) => {
      event.preventDefault()
      const { phoneNumber, code } = event.target.elements

      if (state.verificationId) {
        verify({ code: code.value })

        return
      }

      const n =
        phoneNumber.value.charAt(0) !== "+"
          ? parsePhoneNumber(`+${phoneNumber.value}`, COUNTRY)
          : phoneNumber.value

      if (!n?.isValid()) {
        setError("phoneNumber", "Please enter a valid phone number.")

        return
      }

      handleSignIn({ phoneNumber: n.number })
    },
    [setError, state.verificationId, verify, handleSignIn],
  )

  return (
    <Page>
      <Text h1>Join</Text>
      <form onSubmit={handleFormSubmit}>
        {state.verificationId ? (
          <Input
            name="code"
            placeholder="Code"
            value={state.values.code}
            onChange={edit("code")}
          />
        ) : (
          <Input
            name="phoneNumber"
            placeholder="Phone Number"
            type="tel"
            status={state.errors.phoneNumber && "error"}
            value={state.values.phoneNumber}
            onChange={edit("phoneNumber")}
          />
        )}
        <Button htmlType="submit" id={BUTTON_ID} loading={state.loading}>
          {state.verificationId ? "Verify" : "Join now"}
        </Button>
      </form>
    </Page>
  )
}
