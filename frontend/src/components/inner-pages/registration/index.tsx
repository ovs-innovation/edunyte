import FooterOne from "../../../layouts/footers/FooterOne"
import HeaderOne from "../../../layouts/headers/HeaderOne"
import BreadcrumbOne from "../../common/breadcrumb/BreadcrumbOne"
import RegistrationArea from "./RegistrationArea"
import { useTranslation } from "react-i18next"
const Registration = () => {
   const { t } = useTranslation()
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <BreadcrumbOne title={t('common.student_registration')} sub_title={t('common.student_registration')} />
            <RegistrationArea />
         </main>
         <FooterOne style={false} style_2={false} />
      </>
   );
};

export default Registration;
