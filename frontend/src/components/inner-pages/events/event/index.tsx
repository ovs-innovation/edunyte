import FooterOne from "../../../../layouts/footers/FooterOne"
import HeaderOne from "../../../../layouts/headers/HeaderOne"
import BreadcrumbOne from "../../../common/breadcrumb/BreadcrumbOne"
import EventArea from "./EventArea"
import { useTranslation } from "react-i18next"

const Event = () => {
   const { t } = useTranslation();
   return (
      <>
         <HeaderOne />
         <main className="main-area fix">
            <BreadcrumbOne 
               title={t('events.breadcrumb_title')} 
               sub_title={t('events.breadcrumb_subtitle')} 
               image="/assets/img/others/premium_learning_plus.png"
            />
            <EventArea />
         </main>
         <FooterOne style={false} style_2={false} />
      </>
   )
}

export default Event

