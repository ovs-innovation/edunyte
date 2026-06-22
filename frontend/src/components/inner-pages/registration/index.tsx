import HeaderOne from "../../../layouts/headers/HeaderOne"
import RegistrationArea from "./RegistrationArea"

const Registration = ({ role }: { role?: string }) => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <RegistrationArea role={role} />
         </main>
      </>
   );
};

export default Registration;
