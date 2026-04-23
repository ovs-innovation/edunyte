import FooterOne from "../../../layouts/footers/FooterOne"
import HeaderOne from "../../../layouts/headers/HeaderOne"
import BreadcrumbOne from "../../common/breadcrumb/BreadcrumbOne"
import RegistrationArea from "./RegistrationArea"
import { useTranslation } from "react-i18next"
const Registration = ({ role }: { role?: string }) => {
   const { t } = useTranslation()
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <BreadcrumbOne title={role === 'instructor' || role === 'tutor' ? t('common.instructor_registration') || t('common.tutor_registration') : t('common.student_registration')} sub_title={role === 'instructor' || role === 'tutor' ? t('common.instructor_registration') || t('common.tutor_registration') : t('common.student_registration')} />
         <RegistrationArea role={role} />
      </main>
      <FooterOne style={false} style_2={false} />
    </>
  );
};

export default Registration;
