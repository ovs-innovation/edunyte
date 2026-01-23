import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import LoginForm from "../../../forms/LoginForm"

const LoginArea = () => {
   const { t } = useTranslation()

   return (
      <section className="singUp-area section-py-120">
         <div className="container">
            <div className="row justify-content-center">
               <div className="col-xl-6 col-lg-8">
                  <div className="singUp-wrap">
                     <h2 className="title">{t("common.welcome_back")}</h2>
                     <p>{t("common.login_description")}</p>
                     <div className="account__social">
                        <Link to="#" className="account__social-btn">
                           <img src="/assets/img/icons/google.svg" alt="img" />
                           {t("common.continue_with_google")}
                        </Link>
                     </div>
                     <div className="account__divider">
                        <span>{t("common.or")}</span>
                     </div>
                     <LoginForm />
                     <div className="account__switch">
                        <p>{t("common.dont_have_account")}<Link to="/registration">{t("common.sign_up")}</Link></p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default LoginArea
