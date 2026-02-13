import FooterOne from "../../../../layouts/footers/FooterOne"
import HeaderOne from "../../../../layouts/headers/HeaderOne"
import BreadcrumbTwo from "../../../common/breadcrumb/BreadcrumbTwo"
import InstructorDetailsArea from "./InstructorDetailsArea"

const InstructorsDetails = () => {
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <BreadcrumbTwo title="Become an Instructor" sub_title="" />
            <InstructorDetailsArea />
         </main>
         <FooterOne style={false} style_2={false} />
      </>
   )
}

export default InstructorsDetails
