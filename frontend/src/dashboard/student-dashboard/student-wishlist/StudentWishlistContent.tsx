import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useWishlist } from "../../../contexts/WishlistContext"

const StudentWishlistContent = () => {
   const { wishlist, loading, toggleWishlist } = useWishlist()
   const navigate = useNavigate()
   const { t } = useTranslation()

   if (loading) return <div>{t('common.loading')}</div>

   return (
      <div className="col-lg-9">
         <div className="dashboard__content-wrap">
            <div className="dashboard__content-title">
               <h4 className="title">{t('dashboard.my_wishlist')}</h4>
            </div>
            <div className="row">
               {wishlist.length > 0 ? (
                  wishlist.map((item: any) => {
                     // Distinguish between course and teacher
                     // Courses usually have 'title' or 'name' and 'slug' directly or in 'courseId'
                     // However, the backend return for courses is the Course model.
                     // The backend return for teachers is TeacherProfile populated with userId.
                     
                     const isCourse = item.slug !== undefined || item.category !== undefined;
                     
                     if (isCourse) {
                        const courseId = item._id;
                        const name = item.name;
                        const image = item.image;
                        const slug = item.slug;
                        const category = item.category;
                        
                        return (
                           <div key={courseId} className="col-xl-4 col-md-6">
                              <div 
                                 className="courses__item shine__animate-item"
                                 style={{ cursor: 'pointer', position: 'relative' }}
                              >
                                 <div className="courses__item-thumb">
                                    <div onClick={() => navigate(`/course/${slug || courseId}`)} className="shine__animate-link">
                                       <img 
                                          src={image || "/assets/img/courses/course_default.jpg"} 
                                          alt={name} 
                                          style={{ height: '200px', objectFit: 'cover', width: '100%', borderRadius: '8px 8px 0 0' }} 
                                       />
                                    </div>
                                 </div>

                                 <button 
                                    onClick={(e) => {
                                       e.stopPropagation();
                                       toggleWishlist(courseId);
                                    }} 
                                    className="btn btn-light rounded-circle shadow-sm"
                                    style={{ 
                                       position: 'absolute', 
                                       top: '10px', 
                                       right: '10px', 
                                       zIndex: 10,
                                       width: '36px',
                                       height: '36px',
                                       padding: 0,
                                       display: 'flex',
                                       alignItems: 'center',
                                       justifyContent: 'center',
                                       border: 'none'
                                    }}
                                    title={t('dashboard.remove_from_wishlist')}
                                 >
                                    <i className="fas fa-trash-alt text-danger"></i>
                                 </button>

                                 <div className="courses__item-content">
                                    <ul className="courses__item-meta list-wrap">
                                       <li className="courses__item-tag">
                                          <span>{category || "Uncategorized"}</span>
                                       </li>
                                       <li className="avg-rating"><i className="fas fa-star"></i> (5.0)</li>
                                    </ul>
                                    <h5 className="title mb-3"><a onClick={() => navigate(`/course/${slug || courseId}`)}>{name}</a></h5>
                                    <div className="courses__item-bottom">
                                       <div className="button">
                                          <a onClick={() => navigate(`/course/${slug || courseId}`)}>
                                             <span className="text">{t('common.book_session')}</span>
                                             <i className="flaticon-arrow-right"></i>
                                          </a>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        );
                     } else {
                        // Fallback/Legacy Teacher Display
                        const teacherId = item.userId?._id || item._id;
                        const name = item.userId?.name || t('checkout.tutor');
                        const photo = item.photo;

                        return (
                           <div key={teacherId} className="col-xl-4 col-md-6">
                              <div 
                                 className="courses__item courses__item-two shine__animate-item"
                                 style={{ cursor: 'pointer', position: 'relative' }}
                                 onClick={() => navigate(`/instructor-details?id=${teacherId}`)}
                              >
                                 <div className="courses__item-thumb courses__item-thumb-two">
                                    <img 
                                       src={photo || "/assets/img/instructor/default.png"} 
                                       alt={name} 
                                       style={{ height: '200px', objectFit: 'cover', objectPosition: 'top', width: '100%', borderRadius: '8px 8px 0 0' }} 
                                    />
                                 </div>

                                 <button 
                                    onClick={(e) => {
                                       e.stopPropagation();
                                       toggleWishlist(teacherId);
                                    }} 
                                    className="btn btn-light rounded-circle shadow-sm"
                                    style={{ 
                                       position: 'absolute', 
                                       top: '10px', 
                                       right: '10px', 
                                       zIndex: 10,
                                       width: '36px',
                                       height: '36px',
                                       padding: 0,
                                       display: 'flex',
                                       alignItems: 'center',
                                       justifyContent: 'center',
                                       border: 'none'
                                    }}
                                    title={t('dashboard.remove_from_wishlist')}
                                 >
                                    <i className="fas fa-trash-alt text-danger"></i>
                                 </button>

                                 <div className="courses__item-content courses__item-content-two">
                                    <h5 className="title mb-3" style={{ fontSize: '18px' }}>{name}</h5>
                                    <div className="courses__item-content-bottom">
                                       <div className="avg-rating d-flex align-items-center gap-1">
                                          <i className="fas fa-star text-warning"></i> 
                                          <span className="fw-bold">{item.rating || 0}</span>
                                          <span className="text-muted">({item.totalReviews || 0})</span>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        );
                     }
                  })
               ) : (
                  <div className="col-12">
                     <p>{t('dashboard.wishlist_empty')}</p>
                  </div>
               )}
            </div>
         </div>
      </div>
   )
}

export default StudentWishlistContent
