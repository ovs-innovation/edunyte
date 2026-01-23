import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import RegistrationForm from "../../../forms/RegistrationForm"

const RegistrationArea = () => {
   const { t } = useTranslation()

   return (
      <section className="singUp-area section-py-120">
         <div className="container">
            <div className="row justify-content-center">
               <div className="col-xl-6 col-lg-8">
                  <div className="singUp-wrap">
                     <h2 className="title">{t("common.create_account")}</h2>
                     <p>{t("common.registration_description")}</p>
                     <div className="account__social">
                        <Link to="#" className="account__social-btn">
                           <img src="/assets/img/icons/google.svg" alt="img" />
                           {t("common.continue_with_google")}
                        </Link>
                     </div>
                     <div className="account__divider">
                        <span>{t("common.or")}</span>
                     </div>
                     <RegistrationForm />
                     <div className="account__switch">
                        <p>{t("common.already_have_account")}<Link to="/login">{t("common.login")}</Link></p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default RegistrationArea
