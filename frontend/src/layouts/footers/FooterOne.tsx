import { Link } from "react-router-dom"
import Social from "../../components/common/Social"
import { useTranslation } from "react-i18next";

const FooterOne = ({ style, style_2 }: any) => {
   const { t } = useTranslation();
   return (
      <footer className={`footer__area ${style_2 ? "footer__area-five" : style ? "footer__area-two" : ""}`}>
         <div className={`footer__top ${style_2 ? "footer__top-three" : ""}`}>
            <div className="container">
               <div className="row justify-content-between">
                  {/* Column 1: Brand */}
                  <div className="col-xl-4 col-lg-4 col-md-6 mb-30">
                     <div className="footer__widget">
                        <div className="logo mb-20">
                           <Link to="/">
                              <img src="/logo.png" alt="Edunyte logo" style={{ height: '45px', width: 'auto' }} />
                           </Link>
                        </div>
                        <div className="footer__content">
                           <p className="small opacity-70 mb-20" style={{ maxWidth: '300px', lineHeight: '1.6' }}>
                              {t('footer.description_1')}
                           </p>
                           <ul className="list-wrap footer__social" style={{ display: 'flex', gap: '12px' }}>
                              <Social />
                           </ul>
                        </div>
                     </div>
                  </div>

                  {/* Column 2: Quick Links */}
                  <div className="col-xl-2 col-lg-2 col-md-6 mb-30">
                     <div className="footer__widget">
                        <h4 className="footer__widget-title mb-20" style={{ fontSize: '15px', letterSpacing: '1px' }}>{t('footer.our_company')}</h4>
                        <div className="footer__link">
                           <ul className="list-wrap">
                              <li><Link to="/about-us" className="small opacity-60 hover-text-primary">{t('footer.company_links.about')}</Link></li>
                              <li><Link to="/contact" className="small opacity-60 hover-text-primary">{t('footer.company_links.contact')}</Link></li>
                              <li><Link to="/blog" className="small opacity-60 hover-text-primary">{t('footer.company_links.blog')}</Link></li>
                              <li><Link to="/our-values" className="small opacity-60 hover-text-primary">{t('footer.links.values')}</Link></li>
                           </ul>
                        </div>
                     </div>
                  </div>

                  {/* Column 3: Support */}
                  <div className="col-xl-3 col-lg-3 col-md-6 mb-30">
                     <div className="footer__widget">
                        <h4 className="footer__widget-title mb-20" style={{ fontSize: '15px', letterSpacing: '1px' }}>{t('footer.get_in_touch')}</h4>
                        <div className="footer__contact-content">
                           <ul className="list-wrap small opacity-70">
                              <li className="d-flex gap-2">
                                 <i className="fas fa-envelope text-primary mt-1"></i>
                                 <span>info@edunyte.com</span>
                              </li>
                           </ul>
                        </div>
                     </div>
                  </div>

                  {/* Column 4: App */}
                  <div className="col-xl-2 col-lg-3 col-md-6 mb-30">
                     <div className="footer__widget">
                        <h4 className="footer__widget-title mb-20" style={{ fontSize: '15px', letterSpacing: '1px' }}>{t('footer.mobile_app')}</h4>
                        <div className="app-download">
                           <Link to="#" className="d-block mb-2 hover-scale"><img src="/assets/img/others/google-play.svg" alt="" style={{ height: '35px' }} /></Link>
                           <Link to="#" className="d-block hover-scale"><img src="/assets/img/others/apple-store.svg" alt="" style={{ height: '35px' }} /></Link>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className="footer__bottom border-top" style={{ padding: '20px 0', background: 'rgba(255,255,255,0.2)' }}>
            <div className="container">
               <div className="row align-items-center">
                  <div className="col-md-6">
                     <p className="small m-0 opacity-50">{t('footer.copyright')}</p>
                  </div>
                  <div className="col-md-6 text-md-end">
                     <div className="footer__bottom-menu">
                        <ul className="list-wrap d-flex justify-content-md-end gap-4 m-0">
                           <li><Link to="/contact" className="small opacity-50 hover-text-primary">{t('footer.terms')}</Link></li>
                           <li><Link to="/contact" className="small opacity-50 hover-text-primary">{t('footer.privacy')}</Link></li>
                        </ul>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </footer>
   )
}

export default FooterOne
