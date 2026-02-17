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
         <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
            <div className="footer__widget">
               <h4 className="footer__widget-title">{t('footer.useful_links')}</h4>
               <div className="footer__link">
                  <ul className="list-wrap">
                     <li><Link to="/events-details">{t('footer.links.values')}</Link></li>
                     <li><Link to="/events-details">{t('footer.links.advisory')}</Link></li>
                     <li><Link to="/events-details">{t('footer.links.partners')}</Link></li>
                     <li><Link to="/events-details">{t('footer.links.become_partner')}</Link></li>
                     <li><Link to="/events-details">{t('footer.links.work')}</Link></li>
                     <li><Link to="/events-details">{t('footer.links.quizlet')}</Link></li>
                  </ul>
               </div>
            </div>
         </div>
         <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
            <div className="footer__widget">
               <h4 className="footer__widget-title">{t('footer.our_company')}</h4>
               <div className="footer__link">
                  <ul className="list-wrap">
                     <li><Link to="/about-us">{t('footer.company_links.about')}</Link></li>
                     <li><Link to="/contact">{t('footer.company_links.contact')}</Link></li>
                     <li><Link to="/instructor">{t('footer.company_links.become_teacher')}</Link></li>
                     <li><Link to="/registration">{t('footer.company_links.become_student')}</Link></li>
                     <li><Link to="/blog">{t('footer.company_links.blog')}</Link></li>
                     <li><Link to="/events-details">{t('footer.company_links.events')}</Link></li>
                  </ul>
               </div>
            </div>
         </div>
      </>
   )
}

export default FooterCommon
