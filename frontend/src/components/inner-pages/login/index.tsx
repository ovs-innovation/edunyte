import FooterOne from "../../../layouts/footers/FooterOne"
import HeaderOne from "../../../layouts/headers/HeaderOne"
import BreadcrumbOne from "../../common/breadcrumb/BreadcrumbOne"
import LoginArea from "./LoginArea"
import { useTranslation } from "react-i18next"

const Login = () => {
   const { t } = useTranslation()
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <BreadcrumbOne title={t('common.student_login')} sub_title={t('common.student_login')} />
            <LoginArea />
         </main>
         <FooterOne style={false} style_2={false} />
      </>
   )
}

export default Login

