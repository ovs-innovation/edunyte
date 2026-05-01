import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import RegistrationForm from "../../../forms/RegistrationForm"

const RegistrationArea = ({ role }: { role?: string }) => {
   const { t } = useTranslation()

   return (
      <section 
        className="registration-area py-0 position-relative d-flex align-items-center justify-content-center" 
        style={{ 
            minHeight: '100vh',
            paddingTop: '100px',
            paddingBottom: '50px'
        }}
      >
         
         <div className="container position-relative z-1 py-5">
            <div className="row justify-content-center">
               <div className="col-xl-5 col-lg-7 col-md-10">
                  <div className="glass-panel p-4 p-md-5 shadow-2xl overflow-hidden position-relative" style={{ border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.75)', borderRadius: '24px' }}>
                     
                     <div className="text-center mb-40">
                        <div className="d-inline-flex align-items-center gap-2 p-1 rounded-pill mb-4" style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.05)' }}>
                            <Link to="/student/registration" className={`small fw-bold px-4 py-2 rounded-pill transition-all ${role !== 'instructor' ? 'bg-white shadow-sm text-primary' : 'text-muted'}`} style={{ textDecoration: 'none' }}>Student</Link>
                            <Link to="/instructor/registration" className={`small fw-bold px-4 py-2 rounded-pill transition-all ${role === 'instructor' ? 'bg-white shadow-sm text-primary' : 'text-muted'}`} style={{ textDecoration: 'none' }}>Instructor</Link>
                        </div>
                        <h2 className="title fw-900 mb-2" style={{ fontSize: '2rem' }}>{role === 'instructor' ? "Join as Instructor" : "Create Account"}</h2>
                        <p className="opacity-60">Join thousands of learners worldwide on Edunyte.</p>
                     </div>

                     <RegistrationForm role={role} />

                     <div className="account__switch text-center mt-30 pt-30 border-top">
                        <p className="m-0 text-muted">
                           {t("common.already_have_account")} 
                           <Link to={role === 'instructor' ? "/instructor/login" : "/student/login"} className="ms-2 fw-bold text-primary" style={{ textDecoration: 'none' }}>
                              {t("common.login")}
                           </Link>
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default RegistrationArea
