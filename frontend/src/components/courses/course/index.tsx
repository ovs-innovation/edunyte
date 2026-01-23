import FooterOne from "../../../layouts/footers/FooterOne"
import HeaderOne from "../../../layouts/headers/HeaderOne"
import BreadcrumbOne from "../../common/breadcrumb/BreadcrumbOne"
import CourseArea from "./CourseArea"
import { useTranslation } from "react-i18next"

const Course = () => {
   const { t } = useTranslation();
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <BreadcrumbOne title={t('common.all_courses')} sub_title={t('common.courses')} sub_title_2="" style={false} />
            <CourseArea />
         </main>
         <FooterOne style={false} style_2={true} />
      </>
   )
}

export default Course
