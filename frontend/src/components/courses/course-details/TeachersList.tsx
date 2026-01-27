import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCourseTeachers, type TeacherCourse } from '../../../services/courseService';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';

const TeachersList = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<TeacherCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTeachers = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        setError(null);
        const response = await fetchCourseTeachers(slug);
        setTeachers(response.teachers);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('common.error_loading_data'));
      } finally {
        setLoading(false);
      }
    };
    loadTeachers();
  }, [slug, t]);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleBookTrial = (teacher: TeacherCourse) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const courseId = typeof teacher.courseId === 'object' ? teacher.courseId._id : '';
    navigate(`/booking?teacherCourseId=${teacher._id}&courseId=${courseId}`);
  };

  const handleSendMessage = (teacher: TeacherCourse) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const teacherId = typeof teacher.teacherId === 'object' ? teacher.teacherId._id : '';
    navigate(`/messages?teacherId=${teacherId}`);
  };

  const handleViewSchedule = (teacher: TeacherCourse) => {
    const teacherId = typeof teacher.teacherId === 'object' ? teacher.teacherId._id : '';
    const courseId = typeof teacher.courseId === 'object' ? teacher.courseId._id : '';
    navigate(`/teacher/${teacherId}/schedule?courseId=${courseId}`);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{t('common.loading')}</span>
        </div>
        <p className="mt-3">{t('common.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  if (teachers.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="alert alert-info" role="alert">
          {t('common.no_teachers_available')}
        </div>
      </div>
    );
  }

  return (
    <div className="teachers-list">
      <div className="mb-4 pb-3 border-bottom">
        <h2 className="h3 mb-2 fw-bold">{teachers.length} {t('common.available_teachers')}</h2>
        <p className="text-muted mb-0">{t('common.select_teacher_to_book')}</p>
      </div>

      {teachers.map((teacher) => {
        const teacherName = typeof teacher.teacherId === 'object' ? teacher.teacherId.name : '';
        const languages = teacher.languageIds || [];
        const availabilityCount = teacher.availability?.length || 0;
        const hasVideo = !!teacher.introductionVideo;

        return (
          <div
            key={teacher._id}
            className="teacher-card mb-4 p-4 border rounded shadow-sm"
            style={{
              backgroundColor: '#fff',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
            }}
          >
            <div className="row g-4">
              <div className="col-lg-8">
                <div className="d-flex align-items-start gap-4">
                  <div
                    className="teacher-avatar flex-shrink-0"
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '3px solid #f0f0f0',
                    }}
                  >
                    {teacher.teacherProfile?.photo ? (
                      <img
                        src={teacher.teacherProfile.photo}
                        alt={teacherName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '36px',
                          fontWeight: 'bold',
                        }}
                      >
                        {teacherName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                      <h4 className="h5 mb-0 fw-bold">{teacherName}</h4>
                      <i className="fas fa-check-circle text-primary"></i>
                      {teacher.teacherProfile?.countryCode && (
                        <span className="badge bg-light text-dark border">
                          {teacher.teacherProfile.countryCode}
                        </span>
                      )}
                    </div>
                    <div className="mb-2">
                      <span className="badge bg-primary me-2">{t('common.professional')}</span>
                      {teacher.teacherProfile?.rating >= 4.8 && (
                        <span className="badge bg-warning text-dark">{t('common.super_tutor')}</span>
                      )}
                    </div>
                    <div className="mb-2">
                      <span className="text-muted small">{t('common.speaks')}: </span>
                      {languages.map((lang, idx) => {
                        let langName = '';
                        if (typeof lang === 'object' && lang !== null) {
                          langName = String(lang.nativeName || lang.name || '');
                        } else {
                          langName = String(lang || '');
                        }
                        return (
                          <span key={lang?._id || idx} className="small">
                            {langName}
                            {idx < languages.length - 1 && ', '}
                          </span>
                        );
                      })}
                    </div>
                    {teacher.teacherProfile?.bio && (
                      <p className="text-muted small mb-2" style={{ lineHeight: '1.6' }}>
                        {typeof teacher.teacherProfile.bio === 'string'
                          ? teacher.teacherProfile.bio.length > 200
                            ? `${teacher.teacherProfile.bio.substring(0, 200)}...`
                            : teacher.teacherProfile.bio
                          : ''}
                      </p>
                    )}
                    {teacher.teacherProfile?.rating > 0 && (
                      <div className="d-flex align-items-center gap-3 mb-2 flex-wrap">
                        <div className="d-flex align-items-center">
                          <i className="fas fa-star text-warning me-1"></i>
                          <strong className="me-1">{teacher.teacherProfile.rating.toFixed(1)}</strong>
                          <span className="text-muted small">
                            ({teacher.teacherProfile.totalReviews} {t('common.reviews')})
                          </span>
                        </div>
                        <span className="text-muted small">
                          {teacher.teacherProfile.totalStudents} {t('common.students')}
                        </span>
                        {teacher.teacherProfile.experience > 0 && (
                          <span className="text-muted small">
                            {teacher.teacherProfile.experience} {t('common.years')} {t('common.experience')}
                          </span>
                        )}
                      </div>
                    )}
                    {availabilityCount > 0 && (
                      <div className="availability-section mt-3">
                        <h6 className="mb-2 fw-semibold">{t('common.available_slots')}:</h6>
                        <div className="d-flex flex-wrap gap-2">
                          {teacher.availability.slice(0, 6).map((slot) => (
                            <button
                              key={slot._id}
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => handleBookTrial(teacher)}
                              style={{
                                fontSize: '12px',
                                borderRadius: '6px',
                                padding: '6px 12px',
                              }}
                            >
                              {formatDate(slot.date)} {formatTime(slot.startTime)}
                            </button>
                          ))}
                          {availabilityCount > 6 && (
                            <button
                              className="btn btn-link btn-sm text-primary p-0"
                              onClick={() => handleViewSchedule(teacher)}
                              style={{ textDecoration: 'none' }}
                            >
                              {t('common.view_full_schedule')} →
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="teacher-pricing text-lg-end">
                  <div className="mb-4">
                    <div className="h3 mb-0 fw-bold text-primary">
                      {formatPrice(teacher.price, teacher.currency)}
                    </div>
                    <small className="text-muted">{t('common.per_lesson')}</small>
                  </div>
                  <div className="d-flex flex-column gap-2 mb-3">
                    <button
                      className="btn btn-primary fw-semibold"
                      onClick={() => handleBookTrial(teacher)}
                      style={{
                        backgroundColor: '#e91e63',
                        borderColor: '#e91e63',
                        padding: '12px 24px',
                        borderRadius: '8px',
                      }}
                    >
                      {t('common.book_trial_lesson')}
                    </button>
                    <button
                      className="btn btn-outline-secondary fw-semibold"
                      onClick={() => handleSendMessage(teacher)}
                      style={{
                        padding: '12px 24px',
                        borderRadius: '8px',
                      }}
                    >
                      {t('common.send_message')}
                    </button>
                  </div>
                  {hasVideo && (
                    <div className="mt-3">
                      <div
                        className="video-thumbnail position-relative"
                        style={{
                          width: '100%',
                          aspectRatio: '16/9',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          border: '2px solid #e9ecef',
                        }}
                        onClick={() => {
                          if (teacher.introductionVideo) {
                            window.open(teacher.introductionVideo, '_blank');
                          }
                        }}
                      >
                        <div
                          className="position-absolute top-50 start-50 translate-middle"
                          style={{
                            width: '70px',
                            height: '70px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #e91e63 0%, #f06292 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '28px',
                            boxShadow: '0 4px 12px rgba(233, 30, 99, 0.4)',
                          }}
                        >
                          <i className="fas fa-play" style={{ marginLeft: '4px' }}></i>
                        </div>
                        <div
                          className="position-absolute bottom-0 start-0 end-0 p-2"
                          style={{
                            background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                            color: '#fff',
                            fontSize: '12px',
                            fontWeight: '600',
                          }}
                        >
                          {t('common.watch_intro')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TeachersList;
