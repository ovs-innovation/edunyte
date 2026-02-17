import FooterOne from "../../../../layouts/footers/FooterOne"
import HeaderOne from "../../../../layouts/headers/HeaderOne"
import BreadcrumbTwo from "../../../common/breadcrumb/BreadcrumbTwo"
import InstructorDetailsArea from "./InstructorDetailsArea"
import { useTranslation } from "react-i18next";

const InstructorsDetails = () => {
   const { t } = useTranslation();
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <BreadcrumbTwo title={t("become_instructor_page.breadcrumb_title")} sub_title="" />
            <InstructorDetailsArea />
         </main>
         <FooterOne style={false} style_2={false} />
      </>
   )
}

export default InstructorsDetails
