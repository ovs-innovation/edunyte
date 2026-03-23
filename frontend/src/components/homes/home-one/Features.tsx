import feature_data from "../../../data/home-data/FeatureData";
import { useTranslation } from "react-i18next";

const Features = () => {
   const { t } = useTranslation();

   return (
      <section className="features__area mt-10">
         <div className="container">
            <div className="row justify-content-center">
               <div className="col-xl-6">
                  <div className="section__title white-title text-center mb-50">
                     <span className="sub-title">{t('home.features.subtitle')}</span>
                     <h2 className="title">{t('home.features.title')}</h2>
                     <p>{t('home.features.description')}</p>
                  </div>
               </div>
            </div>
            <div className="row justify-content-center">
               {feature_data.filter((items) => items.page === "home_1").map((item) => (
                  <div key={item.id} className="col-xl-3 col-lg-4 col-md-6">
                     <div className="features__item">
                        <div className="features__icon">
                           <img src={item.icon ? item.icon : ""} className="injectable" alt="img" />
                        </div>
                        <div className="features__content">
                           <h4 className="title">{t(item.title)}</h4>
                           <p>{t(item.desc)}</p>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>
   )
}

export default Features;
