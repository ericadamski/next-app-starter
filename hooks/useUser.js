import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import useSWR from "swr"
import firebase from "firebase/app"
import "firebase/auth"

import { User } from "lib/api"
import initFirebase, { getAuth } from "lib/firebase"
import {
  removeUserCookies,
  setUserCookie,
  getUserFromCookie,
} from "lib/cookies"
import log from "utils/log"

initFirebase()

function fetcher(route, token) {
  return User.get(token)
}

export default function useUser() {
  const [userIdToken, setUserIdToken] = useState()
  const router = useRouter()
  const { data, mutate, error } = useSWR(() => {
    if (!userIdToken) {
      throw new Error("Missing user token")
    }

    return ["/api/user/get", userIdToken]
  }, fetcher)

  const logout = () => {
    return getAuth()
      .signOut()
      .then(() => {
        removeUserCookies()
        router.push("/")
      })
      .catch(log.error)
  }

  useEffect(() => {
    const tokenListener = (user) => {
      if (user) {
        setUserCookie(user)
        mutate()
      } else {
        removeUserCookies()
        mutate()
      }
    }

    const cancelListener = getAuth().onIdTokenChanged(tokenListener)

    getAuth()
      .currentUser.getIdToken()
      .then((token) => setUserIdToken(token))
      .catch(log.error)

    return () => cancelListener()
  }, [])

  return { user: data, loading: !error && !data, logout }
}
