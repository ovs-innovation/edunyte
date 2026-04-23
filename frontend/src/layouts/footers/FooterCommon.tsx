import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next";

const FooterCommon = () => {
   const { t } = useTranslation();
   return (
      <>
         <div className="col-xl-3 col-lg-4 col-md-6">
            <div className="footer__widget">
               <div className="logo mb-35">
                  <Link to="/"><img src="/assets/img/logo/edunyte-light.png" height="100" width="100" alt="img" /></Link>
               </div>
               <div className="footer__content">
                  <p>{t('footer.description_1')}</p>
                  <ul className="list-wrap">
                     <li>{t('footer.address')}</li>
                     <li>{t('footer.phone')}</li>
                  </ul>
               </div>
            </div>
         </div>
      </>
   )
}

export default FooterCommon
