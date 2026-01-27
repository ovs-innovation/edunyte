import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchCategories, type Category } from '../../../services/categoryService';

// slider setting
const setting = {
   slidesPerView: 6,
   spaceBetween: 44,
   loop: true,
   navigation: {
      nextEl: '.categories-button-next',
      prevEl: '.categories-button-prev',
   },
   breakpoints: {
      '1500': {
         slidesPerView: 6,
      },
      '1200': {
         slidesPerView: 5,
      },
      '992': {
         slidesPerView: 4,
         spaceBetween: 30,
      },
      '768': {
         slidesPerView: 3,
         spaceBetween: 25,
      },
      '576': {
         slidesPerView: 2,
      },
      '0': {
         slidesPerView: 2,
         spaceBetween: 20,
      },
   },
};

const Categories = () => {
   const { t } = useTranslation();
   const [categories, setCategories] = useState<Category[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      const loadCategories = async () => {
         try {
            setLoading(true);
            const response = await fetchCategories('active');
            setCategories(response.categories);
            setError(null);
         } catch (err) {
            setError(err instanceof Error ? err.message : t('common.error_loading_data'));
         } finally {
            setLoading(false);
         }
      };

      loadCategories();
   }, [t]);

   const getCategoryIcon = (index: number) => {
      const icons = [
         "flaticon-graphic-design",
         "flaticon-investment",
         "flaticon-coding",
         "flaticon-email",
         "flaticon-fashion",
         "flaticon-interaction",
         "flaticon-web-design",
      ];
      return icons[index % icons.length];
   };

   if (loading) {
      return (
         <section className="categories-area section-py-120">
            <div className="container">
               <div className="row justify-content-center">
                  <div className="col-12 text-center">
                     <p>{t('common.loading')}</p>
                  </div>
               </div>
            </div>
         </section>
      );
   }

   if (error) {
      return (
         <section className="categories-area section-py-120">
            <div className="container">
               <div className="row justify-content-center">
                  <div className="col-12 text-center">
                     <p>{error}</p>
                  </div>
               </div>
            </div>
         </section>
      );
   }

   return (
      <section className="categories-area section-py-120">
         <div className="container">
            <div className="row justify-content-center">
               <div className="col-xl-5 col-lg-7">
                  <div className="section__title text-center mb-40">
                     <span className="sub-title">{t('common.trending_categories')}</span>
                     <h2 className="title">{t('common.top_category_we_have')}</h2>
                     <p className="desc">{t('common.category_description')}</p>
                  </div>
               </div>
            </div>

            <div className="row">
               <div className="col-12">
                  <div className="categories__wrap">
                     <Swiper {...setting} modules={[Navigation]} className="swiper categories-active">
                        {categories.map((item, index) => (
                           <SwiperSlide key={item._id} className="swiper-slide">
                              <div className="categories__item">
                                 <Link to={`/courses?category=${item.slug || item._id}`}>
                                    {item.image ? (
                                       <div className="icon">
                                          <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '50%' }} />
                                       </div>
                                    ) : (
                                       <div className="icon">
                                          <i className={getCategoryIcon(index)}></i>
                                       </div>
                                    )}
                                    <span className="name">{item.name}</span>
                                    <span className="courses">({t('common.courses')})</span>
                                 </Link>
                              </div>
                           </SwiperSlide>
                        ))}
                     </Swiper>

                     <div className="categories__nav">
                        <button className="categories-button-prev">
                           <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M15 7L1 7M1 7L7 1M1 7L7 13" stroke="#161439" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                           </svg>
                        </button>
                        <button className="categories-button-next">
                           <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1 7L15 7M15 7L9 1M15 7L9 13" stroke="#161439" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                           </svg>
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default Categories
