import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import RegistrationForm from "../../../forms/RegistrationForm"
import { motion } from "framer-motion"

const RegistrationArea = ({ role }: { role?: string }) => {
   const { t } = useTranslation()

   const registrationImage = role === 'instructor'
      ? "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1000"
      : "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1000";

   return (
      <section 
        className="registration-area py-0 position-relative d-flex align-items-center justify-content-center" 
        style={{ 
            minHeight: '100vh',
            padding: '20px 0'
        }}
      >
         <div className="position-absolute top-0 start-0 w-100 h-100 glow-bg" style={{ opacity: 0.8, zIndex: 0 }}></div>
         
         <div className="container position-relative z-1">
            <div className="row justify-content-center">
               <div className="col-xl-10 col-lg-12">
                  <motion.div 
                     initial={{ opacity: 0, scale: 0.98 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ duration: 0.6 }}
                     className="glass-panel shadow-2xl overflow-hidden position-relative" 
                     style={{ border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.85)', borderRadius: '24px' }}
                  >
                     <div className="row g-0 align-items-stretch" style={{ minHeight: '650px' }}>
                        
                        {/* Form Side - Left for Registration */}
                        <motion.div 
                           initial={{ x: -20, opacity: 0 }}
                           animate={{ x: 0, opacity: 1 }}
                           transition={{ delay: 0.2, duration: 0.6 }}
                           className="col-lg-6 p-4 p-md-5 d-flex flex-column justify-content-center bg-white bg-opacity-50 order-2 order-lg-1"
                        >
                           <div className="text-center mb-30">
                              <div className="d-inline-flex align-items-center gap-2 p-1 rounded-pill mb-3" style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.05)' }}>
                                 <Link to="/student/registration" className={`small fw-bold px-4 py-1 rounded-pill transition-all ${role !== 'instructor' ? 'bg-white shadow-sm text-primary' : 'text-muted'}`} style={{ textDecoration: 'none' }}>{t('common.student')}</Link>
                                 <Link to="/instructor/registration" className={`small fw-bold px-4 py-1 rounded-pill transition-all ${role === 'instructor' ? 'bg-white shadow-sm text-primary' : 'text-muted'}`} style={{ textDecoration: 'none' }}>{t('common.instructor')}</Link>
                              </div>
                              <h2 className="title fw-900 mb-1" style={{ fontSize: '1.8rem' }}>{role === 'instructor' ? t('common.instructor_registration') : t('common.create_account')}</h2>
                              <p className="opacity-60 small">{t("common.registration_description")}</p>
                           </div>

                           <RegistrationForm role={role} />

                           <div className="account__switch text-center mt-20 pt-20 border-top">
                              <p className="m-0 text-muted small">
                                 {t("common.already_have_account")} 
                                 <Link to={role === 'instructor' ? "/instructor/login" : "/student/login"} className="ms-2 fw-bold text-primary" style={{ textDecoration: 'none' }}>
                                    {t("common.login")}
                                 </Link>
                              </p>
                           </div>
                        </motion.div>

                        {/* Image Side - Right for Registration */}
                        <motion.div 
                           initial={{ x: 20, opacity: 0 }}
                           animate={{ x: 0, opacity: 1 }}
                           transition={{ delay: 0.3, duration: 0.6 }}
                           className="col-lg-6 d-none d-lg-block position-relative order-1 order-lg-2"
                        >
                           <img 
                              src={registrationImage} 
                              alt="Registration Visual" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} 
                           />
                           <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-5" 
                                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7))', backdropFilter: 'blur(1px)' }}>
                              <div className="text-white text-center">
                                 <h2 className="fw-900 mb-3" style={{ fontSize: '2.4rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)', color: '#FFFFFF' }}>{t('common.registration_visual_title')}</h2>
                                 <p className="lead fw-bold" style={{ textShadow: '0 1px 5px rgba(0,0,0,0.5)', color: '#FFFFFF' }}>{t('common.registration_visual_desc')}</p>
                              </div>
                           </div>
                        </motion.div>
                     </div>
                  </motion.div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default RegistrationArea
