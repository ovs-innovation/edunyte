import { Link } from "react-router-dom"
import InjectableSvg from "../../../hooks/InjectableSvg"
import BtnArrow from "../../../svg/BtnArrow"
import { useTranslation } from "react-i18next";

const ErrorArea = () => {
   const { t } = useTranslation();
   return (
      <section className="error-area">
         <div className="container">
            <div className="row justify-content-center">
               <div className="col-lg-8">
                  <div className="error-wrap text-center">
                     <div className="error-img">
                        <InjectableSvg src="assets/img/others/error_img.svg" alt="img" className="injectable" />
                     </div>
                     <div className="error-content">
                        <h2 className="title">{t('error.title')} <span>{t('error.message')}</span></h2>
                        <div className="tg-button-wrap">
                           <Link to="/" className="btn arrow-btn">{t('error.button')} <BtnArrow /></Link>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default ErrorArea
