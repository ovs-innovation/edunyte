import { useEffect, useState } from 'react';
import { fetchCourses, fetchCourseTeachers, type TeacherCourse } from '../../../services/courseService';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useCurrency } from '../../../hooks/useCurrency';

const Tutors = () => {
    const { t } = useTranslation();
    const { formatPrice } = useCurrency();
    const [teachers, setTeachers] = useState<TeacherCourse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTopTutors = async () => {
            try {
                setLoading(true);
                const coursesRes = await fetchCourses({ status: 'active', limit: 5 });
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

                setTeachers(Array.from(teachersMap.values()).slice(0, 6));
            } catch (err) {
                console.error('Failed to load top tutors:', err);
            } finally {
                setLoading(false);
            }
        };

        loadTopTutors();
    }, []);

    if (loading) {
        return (
            <section className="glow-bg py-5">
                <div className="container text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-3 opacity-50">{t('home.one.tutors.finding_tutors', 'Finding the best tutors for you...')}</p>
                </div>
            </section>
        );
    }

    if (teachers.length === 0) return null;

    return (
        <section className="glow-bg" style={{ padding: '80px 0' }}>
            <div className="container">
                <div className="row align-items-end mb-50">
                    <div className="col-lg-8">
                        <div className="section__title pb-10">
                            <span className="sub-title mb-2 text-primary fw-bold" style={{ letterSpacing: '2px' }}>{t('home.one.tutors.sub_title', 'TOP RATED MENTORS')}</span>
                            <h2 className="title fw-900" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>{t('home.one.tutors.title_start', 'Meet our')} <span className="text-grad">{t('home.one.tutors.title_end', 'top tutors')}</span></h2>
                        </div>
                        <p className="opacity-70 mb-0" style={{ maxWidth: '600px' }}>{t('home.one.tutors.description', 'Learn from the best. Our highest-rated tutors are ready to help you achieve your goals with personalized guidance.')}</p>
                    </div>
                    <div className="col-lg-4 text-lg-end mt-4 mt-lg-0">
                        <Link to="/courses" className="btn-neon-primary px-5 py-3">{t('home.one.tutors.view_all', 'View All Courses')}</Link>
                    </div>
                </div>

                <div className="row g-4">
                    {teachers.map((teacher) => {
                        const teacherName = typeof teacher.teacherId === 'object' ? teacher.teacherId.name : 'Expert Tutor';
                        const rating = teacher.teacherProfile?.rating || 5.0;
                        const reviews = teacher.teacherProfile?.totalReviews || 120;
                        const students = teacher.teacherProfile?.totalStudents || 45;
                        const price = typeof teacher.price === 'number' ? teacher.price : (teacher.pricing?.basePriceUSD || 25);
                        const photo = teacher.teacherProfile?.photo;
                        const bio = teacher.teacherProfile?.bio || `Experienced educator specializing in ${typeof teacher.courseId === 'object' ? (teacher.courseId as any).name || 'skills' : 'skills'}.`;

                        return (
                            <div key={teacher._id} className="col-lg-4 col-md-6">
                                <div className="glass-panel h-100 p-4 shadow-sm border-0 bg-white hover-scale position-relative overflow-hidden" 
                                    style={{ transition: 'all 0.3s ease', borderRadius: '24px' }}>
                                    
                                    <div className="d-flex align-items-start gap-3 mb-4">
                                        <div className="flex-shrink-0">
                                            <div style={{ width: '80px', height: '80px', borderRadius: '16px', overflow: 'hidden', border: '3px solid var(--glass-border)', boxShadow: '0 8px 20px rgba(0,0,0,0.05)' }}>
                                                {photo ? (
                                                    <img src={photo} alt={teacherName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.5rem', fontWeight: 900 }}>
                                                        {teacherName.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-grow-1 pt-1">
                                            <h4 className="fw-900 mb-1" style={{ fontSize: '1.25rem' }}>{teacherName}</h4>
                                            <div className="d-flex align-items-center gap-2 mb-2 text-warning small">
                                                <i className="fas fa-star"></i>
                                                <span className="text-dark fw-bold">{rating.toFixed(1)}</span>
                                                <span className="text-muted">({reviews} {t('common.reviews', 'reviews')})</span>
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            <div className="fw-900 text-primary h5 mb-0">{formatPrice(price)}</div>
                                            <div className="small opacity-50">{t('home.one.tutors.per_lesson', '/lesson')}</div>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <div className="d-flex align-items-center gap-2 mb-3 small fw-bold text-dark opacity-75">
                                            <div className="p-1 px-3 rounded-pill bg-light border">
                                                <i className="fas fa-user-graduate text-primary me-2"></i> {students} {t('home.one.tutors.students', 'students')}
                                            </div>
                                            <div className="p-1 px-3 rounded-pill bg-light border">
                                                <i className="fas fa-medal text-warning me-2"></i> {t('home.one.tutors.verified', 'Verified')}
                                            </div>
                                        </div>
                                        <p className="opacity-60 small mb-0" style={{ lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {bio}
                                        </p>
                                    </div>

                                    <div className="d-flex gap-2">
                                        <Link 
                                            to={`/course/${typeof teacher.courseId === 'object' ? (teacher.courseId as any).slug || teacher.courseId._id : teacher.courseId}`} 
                                            className="btn-neon-primary w-100 py-3 text-center small fw-bold"
                                            style={{ textDecoration: 'none' }}
                                        >
                                            {t('common.book_trial_lesson', 'Book Trial Lesson')}
                                        </Link>
                                    </div>
                                    
                                    <div className="position-absolute bottom-0 start-0 w-100" style={{ height: '4px', background: 'var(--grad-primary)', opacity: 0.3 }}></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <style>{`
                .text-grad {
                    background: var(--grad-primary);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
            `}</style>
        </section>
    );
};

export default Tutors;
