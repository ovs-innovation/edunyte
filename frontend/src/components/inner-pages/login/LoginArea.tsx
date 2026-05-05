import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import LoginForm from "../../../forms/LoginForm"
import { motion } from "framer-motion"

const LoginArea = ({ role }: { role?: string }) => {
   const { t } = useTranslation()

   const loginImage = role === 'instructor' 
      ? "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1000" 
      : "https://images.unsplash.com/photo-1491975474562-1f4e30bc9468?auto=format&fit=crop&q=80&w=1000";

   return (
      <section 
        className="login-area py-0 position-relative d-flex align-items-center justify-content-center" 
        style={{ 
            minHeight: '100vh',
            padding: '20px 0'
        }}
      >
         <div className="position-absolute top-0 start-0 w-100 h-100 glow-bg" style={{ opacity: 0.8, zIndex: 0 }}></div>
         
         <div className="container position-relative z-1">
            <div className="row justify-content-center">
               <div className="col-xl-9 col-lg-11">
                  <motion.div 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.6 }}
                     className="glass-panel shadow-2xl overflow-hidden position-relative" 
                     style={{ border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.85)', borderRadius: '24px', minHeight: '550px' }}
                  >
                     <div className="row g-0 align-items-stretch" style={{ minHeight: '550px' }}>
                        {/* Image Side - Left for Login */}
                        <motion.div 
                           initial={{ x: -20, opacity: 0 }}
                           animate={{ x: 0, opacity: 1 }}
                           transition={{ delay: 0.2, duration: 0.6 }}
                           className="col-lg-6 d-none d-lg-block position-relative"
                        >
                           <img 
                              src={loginImage} 
                              alt="Login Visual" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} 
                           />
                           <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-5" 
                                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7))', backdropFilter: 'blur(1px)' }}>
                              <div className="text-white text-center">
                                 <h2 className="fw-900 mb-3" style={{ fontSize: '2.4rem', textShadow: '0 2px 10px rgba(0,0,0,0.4)', color: '#FFFFFF' }}>{t('common.login_visual_title')}</h2>
                                 <p className="lead fw-bold" style={{ textShadow: '0 1px 5px rgba(0,0,0,0.4)', color: '#FFFFFF' }}>{t('common.login_visual_desc')}</p>
                              </div>
                           </div>
                        </motion.div>

                        {/* Form Side */}
                        <motion.div 
                           initial={{ x: 20, opacity: 0 }}
                           animate={{ x: 0, opacity: 1 }}
                           transition={{ delay: 0.3, duration: 0.6 }}
                           className="col-lg-6 p-4 p-md-5 d-flex flex-column justify-content-center bg-white bg-opacity-50"
                        >
                           <div className="text-center mb-30">
                              <div className="d-inline-flex align-items-center gap-2 p-1 rounded-pill mb-3" style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.05)' }}>
                                 <Link to="/student/login" className={`small fw-bold px-4 py-1 rounded-pill transition-all ${role !== 'instructor' ? 'bg-white shadow-sm text-primary' : 'text-muted'}`} style={{ textDecoration: 'none' }}>{t('common.student')}</Link>
                                 <Link to="/instructor/login" className={`small fw-bold px-4 py-1 rounded-pill transition-all ${role === 'instructor' ? 'bg-white shadow-sm text-primary' : 'text-muted'}`} style={{ textDecoration: 'none' }}>{t('common.instructor')}</Link>
                              </div>
                              <h2 className="title fw-900 mb-1" style={{ fontSize: '1.8rem' }}>{role === 'instructor' ? t('common.instructor_login') : t('common.welcome_back')}</h2>
                              <p className="opacity-60 small">{t("common.login_description")}</p>
                           </div>

                           <LoginForm />

                           <div className="account__switch text-center mt-20 pt-20 border-top">
                              <p className="m-0 text-muted small">
                                 {t("common.dont_have_account")} 
                                 <Link to={role === 'instructor' ? "/instructor/registration" : "/student/registration"} className="ms-2 fw-bold text-primary" style={{ textDecoration: 'none' }}>
                                    {t("common.sign_up")}
                                 </Link>
                              </p>
                           </div>
                        </motion.div>
                     </div>
                  </motion.div>
                  
                  <div className="text-center mt-20 small opacity-40">
                    &copy; 2026 Edunyte Learning Platform.
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default LoginArea
