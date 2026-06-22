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
                  {/* Column 1: Logo & Mission */}
                  <div className="col-xl-4 col-lg-4 col-md-12">
                     <div className="footer__widget">
                        <div className="logo mb-15">
                           <Link to="/"><img src="/assets/img/logo/edunyte-light.png" height="85" width="85" alt="Edunyte" /></Link>
                        </div>
                        <div className="footer__content">
                           <p className="mb-10" style={{ maxWidth: '400px', fontSize: '15px', lineHeight: '1.8' }}>
                              {t('footer.description_1')}
                           </p>
                        </div>
                     </div>
                  </div>

                  {/* Column 2: Contact Info */}
                  <div className="col-xl-auto col-lg-auto col-md-6">
                     <div className="footer__widget">
                        <h4 className="footer__widget-title mb-15">{t('footer.get_in_touch')}</h4>
                        <div className="footer__contact-content">
                           <ul className="list-wrap" style={{ fontSize: '15px' }}>
                              <li className="mb-15" style={{ display: 'flex', gap: '10px' }}>
                                 <i className="fas fa-map-marker-alt" style={{ color: 'var(--tg-theme-primary)', marginTop: '5px' }}></i>
                                 {t('footer.address')}
                              </li>
                              <li style={{ display: 'flex', gap: '10px' }}>
                                 <i className="fas fa-phone-alt" style={{ color: 'var(--tg-theme-primary)', marginTop: '5px' }}></i>
                                 {t('footer.phone')}
                              </li>
                           </ul>
                        </div>
                     </div>
                  </div>

                  {/* Column 3: Socials & Apps */}
                  <div className="col-xl-auto col-lg-auto col-md-6">
                     <div className="footer__widget">
                        <h4 className="footer__widget-title mb-15">{t('Community')}</h4>
                        <div className="footer__social-wrap">
                           <ul className="list-wrap footer__social mb-20" style={{ display: 'flex', gap: '15px' }}>
                              <Social />
                           </ul>
                        </div>
                        <div className="app-download-wrap">
                           <p className="mb-15" style={{ fontSize: '14px', fontWeight: '500' }}>Download Our App</p>
                           <div className="app-download" style={{ display: 'flex', gap: '12px' }}>
                              <Link to="#"><img src="/assets/img/others/google-play.svg" alt="Play Store" style={{ height: '38px' }} /></Link>
                              <Link to="#"><img src="/assets/img/others/apple-store.svg" alt="App Store" style={{ height: '38px' }} /></Link>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
            {style_2 && <div className="footer__shape" style={{ backgroundImage: `url(/assets/img/others/h8_footer_shape.svg)` }}></div>}
         </div>

         <div className={`footer__bottom ${style_2 ? "footer__bottom-four" : ""}`}>
            <div className="container">
               <div className="row align-items-center">
                  <div className="col-md-7">
                     <div className="copy-right-text">
                        <p>{t('footer.copyright')}</p>
                     </div>
                  </div>
                  <div className="col-md-5">
                     <div className="footer__bottom-menu">
                        <ul className="list-wrap">
                           <li><Link to="/contact">{t('footer.terms')}</Link></li>
                           <li><Link to="/contact">{t('footer.privacy')}</Link></li>
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
