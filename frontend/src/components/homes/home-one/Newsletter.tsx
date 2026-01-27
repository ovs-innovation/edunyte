

import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

// Use a function component for <br /> to avoid void element issues in Trans
const Br = () => <br />;

const Newsletter = () => {
   const { t } = useTranslation();
   return (
      <section className="newsletter__area">
         <div className="container">
            <div className="row align-items-center">
               <div className="col-lg-4">
                  <div className="newsletter__img-wrap">
                     <img src="/assets/img/others/newsletter_img.png" alt="img" />
                     <img src="/assets/img/others/newsletter_shape01.png" alt="img" data-aos="fade-up" data-aos-delay="400" />
                     <img src="/assets/img/others/newsletter_shape02.png" alt="img" className="alltuchtopdown" />
                  </div>
               </div>
               <div className="col-lg-8">
                  <div className="newsletter__content">
                     <h2 className="title">
                        <Trans i18nKey="newsletter.title" components={[<span />, <Br key="br" />, <span />]} />
                     </h2>
                     <div className="newsletter__form">
                        <form onSubmit={(e) => e.preventDefault()}>
                           <input type="email" placeholder={t('newsletter.placeholder')} />
                           <button type="submit" className="btn">{t('newsletter.subscribe')}</button>
                        </form>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         <div className="newsletter__shape">
            <img src="/assets/img/others/newsletter_shape03.png" alt="img" data-aos="fade-left" data-aos-delay="400" />
         </div>
      </section>
   )
}

export default Newsletter
