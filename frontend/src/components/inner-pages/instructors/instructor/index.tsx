import FooterOne from "../../../../layouts/footers/FooterOne"
import HeaderOne from "../../../../layouts/headers/HeaderOne"
import BreadcrumbOne from "../../../common/breadcrumb/BreadcrumbOne"
import InstructorArea from "./InstructorArea"
import { useTranslation } from "react-i18next";

const Instructors = () => {
   const { t } = useTranslation();
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <BreadcrumbOne title={t('instructor.breadcrumb_title')} sub_title={t('instructor.breadcrumb_subtitle')} />
            <InstructorArea />
         </main>
         <FooterOne style={false} style_2={false} />
      </>
   )
}

export default Instructors
