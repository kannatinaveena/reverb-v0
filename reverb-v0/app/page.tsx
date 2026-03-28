import { Appbar } from "./components/Appbar"
import Landingpage from "./components/Landingpage"
import { Redirect } from "./components/Redirect"


export default function Home() {
  return (
    <div>
      <Appbar/>
      <Redirect/>
      <Landingpage/>
    </div>
  )
}