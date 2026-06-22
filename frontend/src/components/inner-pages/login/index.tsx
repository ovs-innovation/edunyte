import HeaderOne from "../../../layouts/headers/HeaderOne"
import LoginArea from "./LoginArea"

const Login = ({ role }: { role?: string }) => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <LoginArea role={role} />
         </main>
      </>
   )
}

export default Login
