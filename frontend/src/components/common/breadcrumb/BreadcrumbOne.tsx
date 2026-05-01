import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

const BreadcrumbOne = ({ title, sub_title, sub_title_2, style }: any) => {
   const { t } = useTranslation();
   return (
      <section className="breadcrumb__area glow-bg" style={{ padding: '80px 0', borderBottom: '1px solid var(--glass-border)' }}>
         <div className="container">
            <div className="row justify-content-center">
               <div className="col-xl-8 col-lg-10">
                  <div className="breadcrumb__content text-center glass-panel p-5" style={{ background: 'rgba(255,255,255,0.4)' }}>
                     <h2 className="title mb-3" style={{ fontWeight: 900, fontSize: '3.5rem' }}>{title}</h2>
                     <nav className="breadcrumb justify-content-center">
                        <span property="itemListElement" typeof="ListItem">
                           <Link to="/" className="fw-bold">{t('common.home')}</Link>
                        </span>
                        <span className="breadcrumb-separator mx-3 opacity-30"><i className="fas fa-angle-right"></i></span>
                        {style && (
                           <>
                              <span property="itemListElement" typeof="ListItem">
                                 <Link to="/events" className="fw-bold">{sub_title}</Link>
                              </span>
                              <span className="breadcrumb-separator mx-3 opacity-30"><i className="fas fa-angle-right"></i></span>
                              <span property="itemListElement" typeof="ListItem" className="opacity-50 fw-bold">{sub_title_2}</span>
                           </>
                        )}
                        {!style && (
                           <span property="itemListElement" typeof="ListItem" className="opacity-50 fw-bold">{sub_title}</span>
                        )}
                     </nav>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default BreadcrumbOne
