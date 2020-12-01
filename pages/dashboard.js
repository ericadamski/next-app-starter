import { Page, Text } from "@geist-ui/react"

import Redirect from "components/Redirect"
import useUser from "hooks/useUser"

export default function Dashboard() {
  // TOOD: reduce render cycles to get here
  const { user, loading } = useUser()

  return (
    <>
      <Redirect redirectTo="/join" />
      <Page>
        <Text h1>Dashboard</Text>
      </Page>
    </>
  )
}
