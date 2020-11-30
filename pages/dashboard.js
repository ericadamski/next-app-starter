import { Page, Text } from "@geist-ui/react"
import Redirect from "components/Redirect"

export default function Dashboard() {
  return (
    <>
      <Redirect redirectTo="/join" />
      <Page>
        <Text h1>Dashboard</Text>
      </Page>
    </>
  )
}
