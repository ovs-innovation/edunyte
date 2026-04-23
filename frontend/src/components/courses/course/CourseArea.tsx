import { useEffect, useState } from 'react';
import ReactPaginate from 'react-paginate';
import CourseSidebar from './CourseSidebar';
import CourseTop from './CourseTop';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchCourses, type Course } from '../../../services/courseService';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../../../contexts/WishlistContext';

const CourseArea = () => {
   const { t } = useTranslation();
   const [searchParams, setSearchParams] = useSearchParams();
   const categoryId = searchParams.get('category');
   const searchQuery = searchParams.get('search');
   
   const [courses, setCourses] = useState<Course[]>([]);
   const [loading, setLoading] = useState(true);
   const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryId);
   const { toggleWishlist, isInWishlist } = useWishlist();

   useEffect(() => {
      if (categoryId) {
         setSelectedCategory(categoryId);
      }
   }, [categoryId]);

   const handleCategoryChange = (categoryId: string | null) => {
      setSelectedCategory(categoryId);
      const newParams: { category?: string; search?: string } = {};
      if (categoryId) newParams.category = categoryId;
      if (searchQuery) newParams.search = searchQuery;
      setSearchParams(newParams);
   };

   useEffect(() => {
      const loadCourses = async () => {
         try {
            setLoading(true);
            const params: { status: string; category?: string; search?: string } = { 
               status: 'active'
            };
            if (selectedCategory) {
               params.category = selectedCategory;
            }
            if (searchQuery) {
               params.search = searchQuery;
            }
            const response = await fetchCourses(params);
            setCourses(response.courses);
         } catch (err) {
            console.error('Failed to load courses:', err);
         } finally {
            setLoading(false);
         }
      };

      loadCourses();
   }, [selectedCategory, searchQuery]);

   const itemsPerPage = 12;
   const [itemOffset, setItemOffset] = useState(0);
   const endOffset = itemOffset + itemsPerPage;
   const currentItems = courses.slice(itemOffset, endOffset);
   const pageCount = Math.ceil(courses.length / itemsPerPage);

   const startOffset = itemOffset + 1;
   const totalItems = courses.length;

   const handlePageClick = (event: { selected: number }) => {
      const newOffset = (event.selected * itemsPerPage) % courses.length;
      setItemOffset(newOffset);
   };

   const [activeTab, setActiveTab] = useState(0);

   const handleTabClick = (index: number) => {
      setActiveTab(index);
   };

   if (loading) {
      return (
         <section className="all-courses-area section-py-120">
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

   return (
      <section className="all-courses-area section-pt-120 pb-120">
         <div className="container">
            <div className="row">
               <CourseSidebar setSelectedCategory={handleCategoryChange} selectedCategory={selectedCategory} />
               <div className="col-xl-9 col-lg-8">
                  <CourseTop
                     startOffset={startOffset}
                     endOffset={Math.min(endOffset, totalItems)}
                     totalItems={totalItems}
                     courses={courses}
                     setCourses={setCourses}
                     handleTabClick={handleTabClick}
                     activeTab={activeTab}
                  />
                  <div className="tab-content" id="myTabContent">
                     <div className={`tab-pane fade ${activeTab === 0 ? 'show active' : ''}`} id="grid" role="tabpanel" aria-labelledby="grid-tab">
                        <div className="row courses__grid-wrap row-cols-1 row-cols-xl-3 row-cols-lg-2 row-cols-md-2 row-cols-sm-1 mb-50">
                           {currentItems.length === 0 ? (
                              <div className="col-12 text-center">
                                 <p>{t('common.no_courses_found')}</p>
                              </div>
                           ) : (
                              currentItems.map((item) => (
                                 <div key={item._id} className="col">
                                    <div className="courses__item shine__animate-item">
                                       <div className="courses__item-thumb" style={{ position: 'relative' }}>
                                          <Link to={`/course/${item.slug || item._id}`} className="shine__animate-link">
                                             <img src={item.image || '/assets/img/courses/course_default.jpg'} alt={item.name} />
                                          </Link>
                                          <button
                                             onClick={(e) => {
                                                e.preventDefault();
                                                toggleWishlist(item._id);
                                             }}
                                             className="wishlist-btn"
                                             style={{
                                                position: 'absolute',
                                                top: '12px',
                                                right: '12px',
                                                zIndex: 9,
                                                background: '#fff',
                                                borderRadius: '50%',
                                                width: '32px',
                                                height: '32px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: 'none',
                                                cursor: 'pointer',
                                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                             }}
                                          >
                                             <i className={isInWishlist(item._id) ? "fas fa-heart" : "far fa-heart"} style={{ color: isInWishlist(item._id) ? "#e91e63" : "#1A202C", fontSize: '15px' }}></i>
                                          </button>
                                       </div>
                                       <div className="courses__item-content">
                                          <ul className="courses__item-meta list-wrap">
                                             <li className="courses__item-tag">
                                                <Link to={`/courses?category=${selectedCategory || ''}`}>{item.category || t('common.categories')}</Link>
                                             </li>
                                             <li className="avg-rating"><i className="fas fa-star"></i> (5.0 {t('common.reviews')})</li>
                                          </ul>
                                          <h5 className="title"><Link to={`/course/${item.slug || item._id}`}>{item.name}</Link></h5>
                                          {item.description && <p className="info">{item.description}</p>}
                                          <div className="courses__item-bottom">
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
                        {pageCount > 1 && (
                           <nav className="pagination__wrap mt-30">
                              <ReactPaginate
                                 breakLabel="..."
                                 onPageChange={handlePageClick}
                                 pageRangeDisplayed={3}
                                 pageCount={pageCount}
                                 renderOnZeroPageCount={null}
                                 className="list-wrap"
                              />
                           </nav>
                        )}
                     </div>

                     <div className={`tab-pane fade ${activeTab === 1 ? 'show active' : ''}`} id="list" role="tabpanel" aria-labelledby="list-tab">
                        <div className="row courses__list-wrap row-cols-1 mb-50">
                           {currentItems.length === 0 ? (
                              <div className="col-12 text-center">
                                 <p>{t('common.no_courses_found')}</p>
                              </div>
                           ) : (
                              currentItems.map((item) => (
                                 <div key={item._id} className="col">
                                    <div className="courses__item courses__item-three shine__animate-item">
                                       <div className="courses__item-thumb" style={{ position: 'relative' }}>
                                          <Link to={`/course/${item.slug || item._id}`} className="shine__animate-link">
                                             <img src={item.image || '/assets/img/courses/course_default.jpg'} alt={item.name} />
                                          </Link>
                                          <button
                                             onClick={(e) => {
                                                e.preventDefault();
                                                toggleWishlist(item._id);
                                             }}
                                             className="wishlist-btn"
                                             style={{
                                                position: 'absolute',
                                                top: '12px',
                                                right: '12px',
                                                zIndex: 9,
                                                background: '#fff',
                                                borderRadius: '50%',
                                                width: '32px',
                                                height: '32px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: 'none',
                                                cursor: 'pointer',
                                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                             }}
                                          >
                                             <i className={isInWishlist(item._id) ? "fas fa-heart" : "far fa-heart"} style={{ color: isInWishlist(item._id) ? "#e91e63" : "#1A202C", fontSize: '15px' }}></i>
                                          </button>
                                       </div>
                                       <div className="courses__item-content">
                                          <ul className="courses__item-meta list-wrap">
                                             <li className="courses__item-tag">
                                                <Link to={`/courses?category=${selectedCategory || ''}`}>{item.category || t('common.categories')}</Link>
                                                <div className="avg-rating">
                                                   <i className="fas fa-star"></i>  (5.0 {t('common.reviews')})
                                                </div>
                                             </li>
                                          </ul>
                                          <h5 className="title"><Link to={`/course/${item.slug || item._id}`}>{item.name}</Link></h5>
                                          <p className="info">{item.description || ''}</p>
                                          <div className="courses__item-bottom">
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
                        {pageCount > 1 && (
                           <nav className="pagination__wrap mt-30">
                              <ul className="list-wrap">
                                 <ReactPaginate
                                    breakLabel="..."
                                    onPageChange={handlePageClick}
                                    pageRangeDisplayed={3}
                                    pageCount={pageCount}
                                    renderOnZeroPageCount={null}
                                    className="list-wrap"
                                 />
                              </ul>
                           </nav>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   );
};

export default CourseArea;
