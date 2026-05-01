import { useEffect, useState } from 'react';
import { Link } from "react-router-dom"
import { fetchCourses, fetchCourseTeachers, type TeacherCourse } from "../../../../services/courseService";
import { useTranslation } from "react-i18next";

const InstructorArea = () => {
   const { t } = useTranslation();
   const [teachers, setTeachers] = useState<TeacherCourse[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const loadAllTutors = async () => {
          try {
              setLoading(true);
              const coursesRes = await fetchCourses({ status: 'active', limit: 20 });
              const courseSlugs = coursesRes.courses.map(c => c.slug).filter(Boolean) as string[];

              const teachersMap = new Map<string, TeacherCourse>();
              const teachersPromises = courseSlugs.map(slug => fetchCourseTeachers(slug));
              const results = await Promise.allSettled(teachersPromises);

              results.forEach(result => {
                  if (result.status === 'fulfilled') {
                      result.value.teachers.forEach(teacher => {
                          const teacherId = typeof teacher.teacherId === 'object' ? teacher.teacherId._id : teacher.teacherId;
                          if (!teachersMap.has(teacherId)) {
                              teachersMap.set(teacherId, teacher);
                          }
                      });
                  }
              });

              setTeachers(Array.from(teachersMap.values()));
          } catch (err) {
              console.error('Failed to load instructors:', err);
          } finally {
              setLoading(false);
          }
      };

      loadAllTutors();
   }, []);

   if (loading) {
      return (
         <div className="container text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3 opacity-50">{t('common.loading')}</p>
         </div>
      );
   }

   return (
      <section className="instructor__area section-pb-120 glow-bg">
         <div className="container">
            <div className="row g-4">
               {teachers.map((teacher) => {
                  const teacherName = typeof teacher.teacherId === 'object' ? teacher.teacherId.name : 'Expert Tutor';
                  const photo = teacher.teacherProfile?.photo;
                  const designation = teacher.experience ? `${teacher.experience} Years Experience` : 'Expert Instructor';
                  const rating = teacher.teacherProfile?.rating || 5.0;

                  return (
                     <div key={teacher._id} className="col-xl-3 col-lg-4 col-md-6">
                        <div className="glass-panel h-100 p-3 shadow-sm border-0 bg-white hover-scale" style={{ borderRadius: '20px' }}>
                           <div className="instructor__thumb mb-3 overflow-hidden" style={{ borderRadius: '15px', aspectRatio: '1/1' }}>
                              <Link to={`/course/${typeof teacher.courseId === 'object' ? teacher.courseId.slug : teacher.courseId}`}>
                                 {photo ? (
                                    <img src={photo} alt={teacherName} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                                 ) : (
                                    <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white fw-bold" style={{ background: 'var(--grad-primary)', fontSize: '2rem' }}>
                                       {teacherName.charAt(0)}
                                    </div>
                                 )}
                              </Link>
                           </div>
                           <div className="instructor__content text-center">
                              <h2 className="title h5 fw-900 mb-1">
                                 <Link to={`/course/${typeof teacher.courseId === 'object' ? teacher.courseId.slug : teacher.courseId}`} className="text-dark text-decoration-none">
                                    {teacherName}
                                 </Link>
                              </h2>
                              <span className="designation small opacity-50 d-block mb-2">{designation}</span>
                              <p className="avg-rating small mb-3">
                                 <i className="fas fa-star text-warning"></i>
                                 <span className="ms-1 fw-bold">{rating.toFixed(1)}</span>
                                 <span className="opacity-50 ms-1">({t('instructor.ratings')})</span>
                              </p>
                              <div className="instructor__social d-flex justify-content-center gap-2">
                                 <Link to="#" className="p-2 px-3 rounded bg-light text-primary"><i className="fab fa-facebook-f"></i></Link>
                                 <Link to="#" className="p-2 px-3 rounded bg-light text-info"><i className="fab fa-twitter"></i></Link>
                                 <Link to="#" className="p-2 px-3 rounded bg-light text-danger"><i className="fab fa-instagram"></i></Link>
                              </div>
                           </div>
                        </div>
                     </div>
                  )
               })}
            </div>
         </div>
      </section>
   )
}

export default InstructorArea;
