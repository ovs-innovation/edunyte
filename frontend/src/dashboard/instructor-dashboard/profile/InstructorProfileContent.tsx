import { useTranslation } from "react-i18next";

const InstructorProfileContent = ({ style }: any) => {
   const { t } = useTranslation();
   return (
      <div className="col-lg-9">
         <div className="dashboard__content-wrap">
            <div className="dashboard__content-title">
               <h4 className="title">{t("dashboard.my_profile")}</h4>
            </div>
            <div className="row">
               <div className="col-lg-12">
                  <div className="profile__content-wrap">
                     <ul className="list-wrap">
                        <li><span>{t("dashboard.registration_date")}</span> February 28, 2026 8:01 am</li>
                        <li><span>{t("dashboard.first_name")}</span> {style ? "Emily" : "John"} </li>
                        <li><span>{t("dashboard.last_name")}</span>{style ? "Hannah" : "Doe"} </li>
                        <li><span>{t("dashboard.username")}</span> instructor</li>
                        <li><span>{t("dashboard.email")}</span> example@gmail.com</li>
                        <li><span>{t("dashboard.phone_number")}</span> +1-202-555-0174</li>
                        <li><span>{t("dashboard.skill_occupation")}</span> Application Developer</li>
                        <li><span>{t("dashboard.biography")}</span> I&apos;m the Front-End Developer for #ThemeGenix in New York, OR. I have a serious passion for UI effects, animations, and
                           creating intuitive, dynamic user experiences.</li>
                     </ul>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default InstructorProfileContent
