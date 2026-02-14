import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';



const testi_data = [
   {
      id: 1,
      avatar_thumb: "/assets/img/others/testi_author01.png",
      avatar_name: "Wade Warren",
   },
   {
      id: 2,
      avatar_thumb: "/assets/img/others/testi_author02.png",
      avatar_name: "Jenny Wilson",
   },
   {
      id: 3,
      avatar_thumb: "/assets/img/others/testi_author03.png",
      avatar_name: "Guy Hawkin",
   },
   {
      id: 4,
      avatar_thumb: "/assets/img/others/testi_author02.png",
      avatar_name: "Jenny Wilson",
   },
];

const setting = {
   slidesPerView: 3,
   spaceBetween: 30,
   observer: true,
   observeParents: true,
   loop: true,
   breakpoints: {
      '1500': {
         slidesPerView: 3,
      },
      '1200': {
         slidesPerView: 3,
      },
      '992': {
         slidesPerView: 3,
         spaceBetween: 24,
      },
      '768': {
         slidesPerView: 2,
         spaceBetween: 24,
      },
      '576': {
         slidesPerView: 1,
      },
      '0': {
         slidesPerView: 1,
      },
   },
   // Navigation arrows
   navigation: {
      nextEl: ".testimonial-button-next",
      prevEl: ".testimonial-button-prev",
   },
}

const Testimonial = () => {
   const { t } = useTranslation();
   const [isLoop, setIsLoop] = useState(false);
   useEffect(() => {
      setIsLoop(true);
   }, []);

   return (
      <section className="testimonial__area section-py-120">
         <div className="container">
            <div className="row justify-content-center">
               <div className="col-xl-5">
                  <div className="section__title text-center mb-50">
                     <span className="sub-title">{t('about_page.testimonials.subtitle')}</span>
                     <h2 className="title">{t('about_page.testimonials.title')}</h2>
                     <p>{t('about_page.testimonials.description')}</p>
                  </div>
               </div>
            </div>

            <div className="row">
               <div className="col-12">
                  <div className="testimonial__item-wrap">
                     <Swiper
                        {...setting}
                        modules={[Navigation]}
                        loop={isLoop} className="swiper-container testimonial-swiper-active">
                        {testi_data.map((item) => (
                           <SwiperSlide key={item.id} className="swiper-slide">
                              <div className="testimonial__item">
                                 <div className="testimonial__item-top">
                                    <div className="testimonial__author">
                                       <div className="testimonial__author-thumb">
                                          <img src={item.avatar_thumb} alt="img" />
                                       </div>
                                       <div className="testimonial__author-content">
                                          <div className="rating">
                                             <i className="fas fa-star"></i>
                                             <i className="fas fa-star"></i>
                                             <i className="fas fa-star"></i>
                                             <i className="fas fa-star"></i>
                                             <i className="fas fa-star"></i>
                                          </div>
                                          <h2 className="title">{t(`about_page.testimonials.items.${item.id > 3 ? 2 : item.id}.name`)}</h2>
                                       </div>
                                    </div>
                                 </div>
                                 <div className="testimonial__content">
                                    <p>“{t(`about_page.testimonials.items.${item.id > 3 ? 2 : item.id}.desc`)}”</p>
                                 </div>
                              </div>
                           </SwiperSlide>
                        ))}
                     </Swiper>
                     <div className="testimonial__nav">
                        <button className="testimonial-button-prev"><i className="flaticon-arrow-right"></i></button>
                        <button className="testimonial-button-next"><i className="flaticon-arrow-right"></i></button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default Testimonial
