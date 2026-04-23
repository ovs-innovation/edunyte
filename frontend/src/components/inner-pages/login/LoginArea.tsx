import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import LoginForm from "../../../forms/LoginForm"
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../../../firebase-config'
import { useAuth } from "../../../contexts/AuthContext"
import { toast } from "react-toastify"

const LoginArea = ({ role }: { role?: string }) => {
   const { t } = useTranslation()
   const navigate = useNavigate()
   const { firebaseLogin } = useAuth()

   const handleGoogleLogin = async () => {
      try {
         const result = await signInWithPopup(auth, googleProvider);
         const token = await result.user.getIdToken();
         const targetRole = role === 'instructor' ? 'teacher' : 'student';
         
         await firebaseLogin(token, targetRole);
         toast.success(t("common.login_success"), { position: 'top-center' });
      } catch (err: any) {
         console.error("Firebase Error:", err);
         toast.error(err.message || "Google Login failed", { position: 'top-center' });
      }
   };

   return (
      <section className="singUp-area py-0 py-md-1">
         <div className="container">
            <div className="row justify-content-center">
               <div className="col-xl-6 col-lg-8">
                  <div className="singUp-wrap">
                     <div className="courses__nav login-role-toggle mb-30">
                        <ul className="nav nav-tabs justify-content-center" id="roleTab" role="tablist">
                           <li className="nav-item" role="presentation">
                              <Link to="/student/login" className={`nav-link ${role !== 'instructor' ? "active" : ""}`} style={{ display: 'block', width: '100%' }}>{t('common.student')}</Link>
                           </li>
                           <li className="nav-item" role="presentation">
                              <Link to="/instructor/login" className={`nav-link ${role === 'instructor' ? "active" : ""}`} style={{ display: 'block', width: '100%' }}>{t('common.instructor')}</Link>
                           </li>
                        </ul>
                     </div>
                     <h2 className="title">{role === 'instructor' ? t("common.instructor_login") : t("common.welcome_back")}</h2>
                     <p>{t("common.login_description")}</p>
{/* 
                     <div className="account__social">
                        <Link 
                           to="#" 
                           className="account__social-btn"
                           onClick={(e) => {
                              e.preventDefault();
                              handleGoogleLogin();
                           }}
                        >
                           <img src="/assets/img/icons/google.svg" alt="img" />
                           {t("common.continue_with_google")}
                        </Link>
                     </div>
                     <div className="account__divider">
                        <span>{t("common.or")}</span>
                     </div> 
*/}
                     <LoginForm />
                     <div className="account__switch">
                        <p>{t("common.dont_have_account")}<Link to={role === 'instructor' ? "/instructor/registration" : "/student/registration"}>{t("common.sign_up")}</Link></p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default LoginArea
