import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import firebase from "firebase/app";
import "firebase/auth";

import initFirebase from "lib/firebase";
import {
  removeUserCookies,
  setUserCookie,
  getUserFromCookie,
} from "lib/cookies";

initFirebase();

export const useUser = () => {
  const [user, setUser] = useState();
  const router = useRouter();

  const logout = () => {
    return firebase
      .auth()
      .signOut()
      .then(() => {
        router.push("/welcome");
        removeUserCookies();
      })
      .catch((e) => console.error(e));
  };

  useEffect(() => {
    const tokenListener = (user) => {
      if (user) {
        setUser(setUserCookie(user));
      } else {
        removeUserCookies();
        setUser();
      }
    };

    const cancelListener = firebase.auth().onIdTokenChanged(tokenListener);

    const userFromCookie = getUserFromCookie();

    if (userFromCookie) {
      setUser(userFromCookie);
    }

    return () => cancelListener();
  }, []);

  return { user, logout };
};
