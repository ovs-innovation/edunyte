import { useTranslation } from 'react-i18next';

const Features = () => {
   const { t } = useTranslation();
   // @ts-ignore
   const features = t('features', { returnObjects: true });
   return (
      <section className="features__area">
         <div className="container">
            <div className="row justify-content-center">
               <div className="col-xl-6">
                  <div className="section__title white-title text-center mb-50">
                     <span className="sub-title">{t('features_section.sub_title')}</span>
                     <h2 className="title">{t('features_section.title')}</h2>
                     <p>{t('features_section.desc')}</p>
                  </div>
               </div>
            </div>
            <div className="row justify-content-center">
               {features.map((item: any, idx: number) => (
                  <div key={idx} className="col-xl-3 col-lg-4 col-md-6">
                     <div className="features__item">
                        <div className="features__icon">
                           {item.icon && <img src={item.icon} className="injectable" alt="img" />}
                        </div>
                        <div className="features__content">
                           <h4 className="title">{item.title}</h4>
                           <p>{item.desc}</p>
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
