import { useDispatch } from "react-redux";
import { addToWishlist } from "../../../redux/features/wishlistSlice";
import InjectableSvg from "../../../hooks/InjectableSvg";
import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchCourses, type Course } from "../../../services/courseService";
import { fetchCategories, type Category } from "../../../services/categoryService";

const Courses = () => {
   const dispatch = useDispatch();
   const { t } = useTranslation();
   const [searchParams] = useSearchParams();
   const categoryId = searchParams.get('category');
   const [courses, setCourses] = useState<Course[]>([]);
   const [categories, setCategories] = useState<Category[]>([]);
   const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryId);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      const loadCategories = async () => {
         try {
            const response = await fetchCategories('active');
            setCategories(response.categories);
         } catch (err) {
            console.error('Failed to load categories:', err);
         }
      };
      loadCategories();
   }, []);

   useEffect(() => {
      const loadCourses = async () => {
         try {
            setLoading(true);
            const params: { status: string; limit: number; category?: string } = { 
               status: 'active', 
               limit: 8 
            };
            if (selectedCategory) {
               params.category = selectedCategory;
            }
            const response = await fetchCourses(params);
            setCourses(response.courses);
            setError(null);
         } catch (err) {
            setError(err instanceof Error ? err.message : t('common.error_loading_data'));
         } finally {
            setLoading(false);
         }
      };

      loadCourses();
   }, [t, selectedCategory]);

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
         <section className="courses-area-four courses__bg-three" style={{ backgroundImage: `url(/assets/img/bg/h5_courses_bg.jpg)` }}>
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
         <section className="courses-area-four courses__bg-three" style={{ backgroundImage: `url(/assets/img/bg/h5_courses_bg.jpg)` }}>
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
      <section className="courses-area-four courses__bg-three" style={{ backgroundImage: `url(/assets/img/bg/h5_courses_bg.jpg)` }}>
         <div className="courses__bg-shape-one">
            <InjectableSvg src="/assets/img/courses/h5_courses_bg_shape01.svg" alt="" className="injectable" />
         </div>
         <div className="courses__bg-shape-two">
            <InjectableSvg src="/assets/img/courses/h5_courses_bg_shape02.svg" alt="" className="injectable" />
         </div>
         <div className="container">
            <div className="row justify-content-center">
               <div className="col-xl-5 col-lg-8">
                  <div className="section__title text-center mb-50">
                     <span className="sub-title">{t('common.top_class_courses')}</span>
                     <h2 className="title bold">{t('common.best_exciting_class_experience')}</h2>
                  </div>
               </div>
            </div>

            {categories.length > 0 && (
               <div className="row justify-content-center mb-40">
                  <div className="col-12">
                     <div className="courses__filter" style={{
                        display: 'flex',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                        marginBottom: '30px'
                     }}>
                        <button
                           className={!selectedCategory ? 'active' : ''}
                           onClick={() => setSelectedCategory(null)}
                           style={{
                              padding: '10px 24px',
                              border: '2px solid #e0e0e0',
                              borderRadius: '30px',
                              background: !selectedCategory ? '#6c5ce7' : 'transparent',
                              color: !selectedCategory ? '#fff' : '#333',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              fontSize: '14px',
                              fontWeight: '500',
                              whiteSpace: 'nowrap'
                           }}
                           onMouseEnter={(e) => {
                              if (!selectedCategory) return;
                              e.currentTarget.style.background = '#f5f5f5';
                              e.currentTarget.style.borderColor = '#6c5ce7';
                           }}
                           onMouseLeave={(e) => {
                              if (!selectedCategory) return;
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.borderColor = '#e0e0e0';
                           }}
                        >
                           {t('common.all_courses')}
                        </button>
                        {categories.map((cat) => (
                           <button
                              key={cat._id}
                              className={selectedCategory === cat._id ? 'active' : ''}
                              onClick={() => setSelectedCategory(cat._id)}
                              style={{
                                 padding: '10px 24px',
                                 border: '2px solid #e0e0e0',
                                 borderRadius: '30px',
                                 background: selectedCategory === cat._id ? '#6c5ce7' : 'transparent',
                                 color: selectedCategory === cat._id ? '#fff' : '#333',
                                 cursor: 'pointer',
                                 transition: 'all 0.3s ease',
                                 fontSize: '14px',
                                 fontWeight: '500',
                                 whiteSpace: 'nowrap'
                              }}
                              onMouseEnter={(e) => {
                                 if (selectedCategory !== cat._id) {
                                    e.currentTarget.style.background = '#f5f5f5';
                                    e.currentTarget.style.borderColor = '#6c5ce7';
                                 }
                              }}
                              onMouseLeave={(e) => {
                                 if (selectedCategory !== cat._id) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.borderColor = '#e0e0e0';
                                 }
                              }}
                           >
                              {cat.name}
                           </button>
                        ))}
                     </div>
                  </div>
               </div>
            )}

            {courses.length === 0 && !loading && (
               <div className="row justify-content-center">
                  <div className="col-12 text-center">
                     <p>{t('common.no_courses_found')}</p>
                  </div>
               </div>
            )}

            <div className="row justify-content-center">
               {courses.map((item) => (
                  <div key={item._id} className="col-xl-3 col-lg-4 col-md-6">
                     <div className="courses__item-six shine__animate-item">
                        <div className="courses__item-thumb-five shine__animate-link">
                           <Link to={`/course/${item.slug || item._id}`}>
                              <img src={item.image || '/assets/img/courses/course_default.jpg'} alt={item.name} />
                           </Link>
                           <a onClick={() => handleAddToWishlist(item)} className="courses__wishlist-two course-heart-btn" style={{ cursor: "pointer" }}>
                              <InjectableSvg src="/assets/img/icons/heart02.svg" alt="" className="injectable" />
                           </a>
                        </div>
                        <div className="courses__item-content-five">
                           <ul className="courses__item-meta list-wrap">
                              <li className="courses__review courses__review-two">
                                 <div className="rating">
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                    <i className="fas fa-star"></i>
                                 </div>
                                 <span>(5.0 {t('common.reviews')})</span>
                              </li>
                           </ul>
                           <h2 className="title">
                              <Link to={`/course/${item.slug || item._id}`}>{item.name}</Link>
                           </h2>
                           <p>{item.description || ''}</p>
                           <div className="courses__item-content-bottom-two">
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
               ))}
            </div>
         </div>
         <div className="courses__shape-wrap-three">
            <img src="/assets/img/courses/h5_courses_shape01.svg" alt="shape" data-aos="fade-right" data-aos-delay="400" />
            <img src="/assets/img/courses/h5_courses_shape01.svg" alt="shape" data-aos="fade-up-right" data-aos-delay="400" />
            <img src="/assets/img/courses/h5_courses_shape01.svg" alt="shape" className="alltuchtopdown" />
            <img src="/assets/img/courses/h5_courses_shape01.svg" alt="shape" data-aos="fade-up-left" data-aos-delay="400" />
         </div>
      </section>
   )
}

export default Courses
