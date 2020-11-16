import { Text, Button, Row, useToasts } from "@geist-ui/react";
import React, { useState } from "react";
import Router from "next/router";
import firebase from "firebase/app";
import "firebase/auth";

import initFirebase from "lib/firebase";
import { setUserCookie } from "lib/cookies";

initFirebase();

/**
 * Add supported firebase providers
 */

export default function Authentication() {
  const [, setToast] = useToasts();
  const [authorizing, setAuthorizing] = useState(false);

  const handleLogin = async () => {
    setAuthorizing(true);

    setTimeout(() => setAuthorizing(false), 1000);
  };

  return (
    <>
      <Button onClick={handleLogin} loading={authorizing}>
        Log in
      </Button>
    </>
  );
}
