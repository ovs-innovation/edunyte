import FooterOne from "../../../layouts/footers/FooterOne"
import HeaderOne from "../../../layouts/headers/HeaderOne"
import BreadcrumbOne from "../../common/breadcrumb/BreadcrumbOne"
import ContactArea from "./ContactArea"
import { useTranslation } from "react-i18next";

const Contact = () => {
   const { t } = useTranslation();
   return (
      <>
         <HeaderOne />
         <main className="main-area fix glow-bg">
            <BreadcrumbOne title={t('contact.breadcrumb_title')} sub_title={t('contact.breadcrumb_subtitle')} />
            <ContactArea />
         </main>
         <FooterOne style={false} style_2={false} />
      </>
   )
}

export default Contact

