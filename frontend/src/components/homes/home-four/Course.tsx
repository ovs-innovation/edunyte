import { useDispatch } from "react-redux";
import { addToWishlist } from "../../../redux/features/wishlistSlice";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import InjectableSvg from "../../../hooks/InjectableSvg";
import { fetchCourses, type Course } from "../../../services/courseService";
const Course = () => {
   const dispatch = useDispatch();
   const { t } = useTranslation();
   const [courses, setCourses] = useState<Course[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      const loadCourses = async () => {
         try {
            setLoading(true);
            const response = await fetchCourses({ status: 'active', limit: 8 });
            setCourses(response.courses);
            setError(null);
         } catch (err) {
            setError(err instanceof Error ? err.message : t('common.error_loading_data'));
         } finally {
            setLoading(false);
         }
      };

      loadCourses();
   }, [t]);

   const handleAddToWishlist = (item: Course) => {
      const wishlistItem = {
         id: parseInt(item._id.slice(-8), 16) || Math.floor(Math.random() * 1000000),
         title: item.name,
         thumb: item.image || '/assets/img/courses/course_default.jpg',
         price: 0,
      };
      dispatch(addToWishlist(wishlistItem));
   };

   if (loading) {
      return (
         <section className="courses-area-three section-pt-140 section-pb-110 courses__bg-two" style={{ backgroundImage: `url(/assets/img/bg/h4_courses_bg.jpg)` }}>
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
         <section className="courses-area-three section-pt-140 section-pb-110 courses__bg-two" style={{ backgroundImage: `url(/assets/img/bg/h4_courses_bg.jpg)` }}>
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
      <section className="courses-area-three section-pt-140 section-pb-110 courses__bg-two" style={{ backgroundImage: `url(/assets/img/bg/h4_courses_bg.jpg)` }}>
         <div className="container">
            <div className="row justify-content-center">
               <div className="col-xl-5 col-lg-8">
                  <div className="section__title text-center mb-50">
                     <span className="sub-title">{t('common.top_class_courses')}</span>
                     <h2 className="title">{t('common.best_exciting_class_experience')}</h2>
                  </div>
               </div>
            </div>
            <div className="row gutter-24 justify-content-center">
               {courses.length === 0 ? (
                  <div className="col-12 text-center">
                     <p>{t('common.no_courses_found')}</p>
                  </div>
               ) : (
                  courses.map((item) => (
                     <div key={item._id} className="col-xl-3 col-lg-4 col-md-6">
                        <div className="courses__item-five shine__animate-item">
                           <div className="courses__item-thumb-four shine__animate-link">
                                  <Link to={`/course/${item.slug || item._id}`}>
                                     <img src={item.image || '/assets/img/courses/course_default.jpg'} alt={item.name} />
                                  </Link>
                                  <a onClick={() => handleAddToWishlist(item)} className="courses__wishlist-two course-heart-btn" style={{ cursor: "pointer" }}>
                                     <InjectableSvg src="/assets/img/icons/heart02.svg" alt="" className="injectable" />
                                  </a>
                               </div>
                               <div className="courses__item-content-four">
                                  <ul className="courses__item-meta list-wrap">
                                     <li className="courses__item-tag courses__item-tag-two">
                                        <Link to={`/courses?category=${item.category || ''}`}>{item.category || t('common.categories')}</Link>
                                     </li>
                                     <li className="avg-rating"><i className="fas fa-star"></i> (5.0 {t('common.reviews')})</li>
                                  </ul>
                                  <h2 className="title"><Link to={`/course/${item.slug || item._id}`}>{item.name}</Link></h2>
                                  {item.description && <p className="info">{item.description}</p>}
                                  <div className="courses__item-bottom-three">
                                     <div className="button">
                                        <Link to={`/course/${item.slug || item._id}`}>
                                       <span className="text">{t('common.book_session')}</span>
                                       <i className="flaticon-arrow-right"></i>
                                    </Link>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  ))
               )}
            </div>
         </div>
         <div className="courses__shape-wrap-two">
            <img src="/assets/img/courses/h4_course_shape.svg" alt="shape" className="rotateme" />
            <img src="/assets/img/courses/h4_course_shape.svg" alt="shape" className="rotateme" />
         </div>
      </section>
   )
}

export default Course
