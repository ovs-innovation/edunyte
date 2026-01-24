import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCourseTeachers, type TeacherCourse } from '../../../services/courseService';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import BookingModal from './BookingModal';

interface FilterState {
  priceRange: string;
  country: string;
  availability: string;
  sortBy: string;
  search: string;
}

const TeachersSelection = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<TeacherCourse[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<TeacherCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherCourse | null>(null);
  const [hoveredTeacher, setHoveredTeacher] = useState<string | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingTeacher, setBookingTeacher] = useState<TeacherCourse | null>(null);
  const [expandedBios, setExpandedBios] = useState<Set<string>>(new Set());
  const [favoriteTeachers, setFavoriteTeachers] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterState>({
    priceRange: '',
    country: '',
    availability: '',
    sortBy: 'top_picks',
    search: '',
  });

  useEffect(() => {
    const loadTeachers = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        setError(null);
        const response = await fetchCourseTeachers(slug);
        setTeachers(response.teachers);
        setFilteredTeachers(response.teachers);
        if (response.teachers.length > 0) {
          setSelectedTeacher(response.teachers[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t('common.error_loading_data'));
      } finally {
        setLoading(false);
      }
    };
    loadTeachers();
  }, [slug, t]);

  useEffect(() => {
    let filtered = [...teachers];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((teacher) => {
        const teacherName = typeof teacher.teacherId === 'object' ? teacher.teacherId.name : '';
        const bio = teacher.teacherProfile?.bio || '';
        return teacherName.toLowerCase().includes(searchLower) || bio.toLowerCase().includes(searchLower);
      });
    }

    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      filtered = filtered.filter((teacher) => {
        const price = teacher.price || 0;
        if (max) {
          return price >= min && price <= max;
        }
        return price >= min;
      });
    }

    if (filters.country) {
      filtered = filtered.filter((teacher) => {
        return teacher.teacherProfile?.countryCode === filters.country;
      });
    }

    if (filters.availability === 'available') {
      filtered = filtered.filter((teacher) => {
        return teacher.availability && teacher.availability.length > 0;
      });
    }

    switch (filters.sortBy) {
      case 'price_low':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_high':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.teacherProfile?.rating || 0) - (a.teacherProfile?.rating || 0));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.teacherProfile?.totalStudents || 0) - (a.teacherProfile?.totalStudents || 0));
        break;
      default:
        filtered.sort((a, b) => (b.teacherProfile?.rating || 0) - (a.teacherProfile?.rating || 0));
    }

    setFilteredTeachers(filtered);
    if (filtered.length > 0 && (!selectedTeacher || !filtered.find((t) => t._id === selectedTeacher._id))) {
      setSelectedTeacher(filtered[0]);
    }
  }, [filters, teachers, selectedTeacher]);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getCountryFlag = (countryCode: string): string => {
    if (!countryCode || countryCode.length !== 2) return '';
    try {
      const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map((char) => 127397 + char.charCodeAt(0));
      return String.fromCodePoint(...codePoints);
    } catch {
      return '';
    }
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

  const getPriceRanges = () => {
    if (teachers.length === 0) return [];
    const prices = teachers.map((t) => t.price || 0).filter((p) => p > 0);
    if (prices.length === 0) return [];
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const step = Math.ceil((max - min) / 4);
    return [
      `${min}-${min + step}`,
      `${min + step + 1}-${min + step * 2}`,
      `${min + step * 2 + 1}-${min + step * 3}`,
      `${min + step * 3 + 1}+`,
    ];
  };

  const getCountries = () => {
    const countries = new Set<string>();
    teachers.forEach((teacher) => {
      if (teacher.teacherProfile?.countryCode) {
        countries.add(teacher.teacherProfile.countryCode);
      }
    });
    return Array.from(countries);
  };

  const handleBookTrial = (teacher: TeacherCourse) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setBookingTeacher(teacher);
    setBookingModalOpen(true);
  };

  const handleBookingConfirm = (bookingData: any) => {
    navigate(`/booking/confirm`, { state: bookingData });
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

  const toggleBio = (teacherId: string) => {
    setExpandedBios((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(teacherId)) {
        newSet.delete(teacherId);
      } else {
        newSet.add(teacherId);
      }
      return newSet;
    });
  };

  const toggleFavorite = (teacherId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteTeachers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(teacherId)) {
        newSet.delete(teacherId);
      } else {
        newSet.add(teacherId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{t('common.loading')}</span>
        </div>
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

  const priceRanges = getPriceRanges();
  const countries = getCountries();

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .teachers-selection-page .filters-bar {
            flex-direction: column !important;
          }
          .teachers-selection-page .filter-item {
            width: 100% !important;
            min-width: 100% !important;
            flex: 1 1 100% !important;
          }
          .teachers-selection-page .teacher-card {
            padding: 16px !important;
          }
          .teachers-selection-page .teacher-card .text-end {
            text-align: left !important;
            margin-top: 12px;
            margin-left: 0 !important;
          }
          .teachers-selection-page .teacher-card .text-end .w-100 {
            width: 100% !important;
          }
        }
        @media (max-width: 992px) {
          .teachers-selection-page .teacher-video-sidebar {
            position: relative !important;
            top: 0 !important;
            margin-top: 24px;
          }
        }
        @media (min-width: 1200px) {
          .teachers-selection-page .container {
            padding: 40px 40px !important;
          }
        }
        .teachers-selection-page .filters-bar .form-control:focus,
        .teachers-selection-page .filters-bar .form-select:focus {
          border-color: #e91e63 !important;
          box-shadow: 0 0 0 3px rgba(233, 30, 99, 0.1) !important;
          outline: none !important;
        }
      `}</style>
      <div className="teachers-selection-page" style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
        <div className="container" style={{ maxWidth: '1400px', padding: '40px 20px' }}>
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="h2 fw-bold mb-2" style={{ fontSize: '32px', color: '#1a1a1a' }}>
              {filteredTeachers.length} {t('common.available_teachers')} {t('common.to_help_you_succeed')}
            </h1>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-12">
            <div
              className="filters-bar"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                alignItems: 'center',
                padding: '16px',
                backgroundColor: '#fff',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              <div className="filter-item" style={{ position: 'relative', flex: '1 1 200px', minWidth: '200px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder={t('common.search_by_name')}
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    padding: '10px 16px',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#e91e63';
                    e.target.style.boxShadow = '0 0 0 3px rgba(233, 30, 99, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <i
                  className="fas fa-search"
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#999',
                    pointerEvents: 'none',
                  }}
                ></i>
              </div>
              <div className="filter-item" style={{ flex: '0 1 auto', minWidth: '160px' }}>
                <select
                  className="form-select"
                  value={filters.priceRange}
                  onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    padding: '10px 16px',
                    fontSize: '14px',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    paddingRight: '40px',
                  }}
                >
                  <option value="">{t('common.price_per_lesson')}</option>
                  {priceRanges.map((range, idx) => (
                    <option key={idx} value={range}>
                      {range}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-item" style={{ flex: '0 1 auto', minWidth: '160px' }}>
                <select
                  className="form-select"
                  value={filters.country}
                  onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    padding: '10px 16px',
                    fontSize: '14px',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    paddingRight: '40px',
                  }}
                >
                  <option value="">{t('common.any_country')}</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-item" style={{ flex: '0 1 auto', minWidth: '160px' }}>
                <select
                  className="form-select"
                  value={filters.availability}
                  onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    padding: '10px 16px',
                    fontSize: '14px',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    paddingRight: '40px',
                  }}
                >
                  <option value="">{t('common.im_available')}</option>
                  <option value="available">{t('common.has_availability')}</option>
                </select>
              </div>
              <div className="filter-item" style={{ flex: '0 1 auto', minWidth: '180px' }}>
                <select
                  className="form-select"
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    padding: '10px 16px',
                    fontSize: '14px',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    paddingRight: '40px',
                  }}
                >
                  <option value="top_picks">{t('common.sort_by_top_picks')}</option>
                  <option value="price_low">{t('common.sort_by_price_low')}</option>
                  <option value="price_high">{t('common.sort_by_price_high')}</option>
                  <option value="rating">{t('common.sort_by_rating')}</option>
                  <option value="popular">{t('common.sort_by_popular')}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <div className="teachers-list">
              {filteredTeachers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted">{t('common.no_teachers_found')}</p>
                </div>
              ) : (
                filteredTeachers.map((teacher) => {
                  const teacherId = typeof teacher.teacherId === 'object' ? teacher.teacherId : { name: '', _id: '' };
                  const teacherName = String(teacherId.name || '');
                  const languages = Array.isArray(teacher.languageIds) ? teacher.languageIds : [];
                  const courseId = typeof teacher.courseId === 'object' ? teacher.courseId : null;
                  let courseName = '';
                  if (courseId && courseId.name) {
                    if (typeof courseId.name === 'string') {
                      courseName = courseId.name;
                    } else if (typeof courseId.name === 'object' && courseId.name !== null) {
                      courseName = (courseId.name as any).en || String(courseId.name);
                    }
                  }
                  const availabilityCount = Array.isArray(teacher.availability) ? teacher.availability.length : 0;
                  const isHovered = hoveredTeacher === teacher._id;
                  const isSelected = selectedTeacher?._id === teacher._id;

                  return (
                    <div
                      key={teacher._id}
                      className={`teacher-card mb-3 border rounded position-relative ${
                        isSelected ? 'border-primary' : ''
                      }`}
                      style={{
                        backgroundColor: '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        padding: '20px',
                        boxShadow: isSelected ? '0 4px 12px rgba(233, 30, 99, 0.15)' : '0 2px 4px rgba(0,0,0,0.08)',
                      }}
                      onMouseEnter={() => setHoveredTeacher(teacher._id)}
                      onMouseLeave={() => setHoveredTeacher(null)}
                      onClick={() => setSelectedTeacher(teacher)}
                    >
                      <div className="position-absolute" style={{ top: '20px', right: '20px', zIndex: 2 }}>
                        <div className="d-flex align-items-start mb-2" style={{ gap: '16px' }}>
                          <div className="text-end">
                            <div className="fw-bold text-primary mb-1" style={{ fontSize: '28px' }}>
                              {formatPrice(teacher.price || 0, teacher.currency || 'INR')}
                            </div>
                            <small className="text-muted d-block" style={{ fontSize: '12px' }}>
                              {t('common.per_hour')}
                            </small>
                          </div>
                          <button
                            className="btn btn-link p-0"
                            onClick={(e) => toggleFavorite(teacher._id, e)}
                            style={{
                              width: '32px',
                              height: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              flexShrink: 0,
                            }}
                          >
                            <i
                              className={favoriteTeachers.has(teacher._id) ? 'fas fa-heart' : 'far fa-heart'}
                              style={{
                                fontSize: '20px',
                                color: favoriteTeachers.has(teacher._id) ? '#e91e63' : '#999',
                                transition: 'color 0.2s',
                              }}
                            ></i>
                          </button>
                        </div>
                        <div className="d-flex flex-column align-items-end gap-2 mt-3">
                          <button
                            className="btn btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBookTrial(teacher);
                            }}
                            style={{
                              backgroundColor: '#e91e63',
                              borderColor: '#e91e63',
                              fontSize: '13px',
                              padding: '10px 20px',
                              borderRadius: '8px',
                              fontWeight: '500',
                              color: '#fff',
                              width: '100%',
                              minWidth: '140px',
                            }}
                          >
                            {t('common.book_trial_lesson')}
                          </button>
                          <button
                            className="btn btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSendMessage(teacher);
                            }}
                            style={{
                              backgroundColor: '#fff',
                              borderColor: '#ddd',
                              borderWidth: '1px',
                              borderStyle: 'solid',
                              fontSize: '13px',
                              padding: '10px 20px',
                              borderRadius: '8px',
                              fontWeight: '500',
                              color: '#1a1a1a',
                              width: '100%',
                              minWidth: '140px',
                            }}
                          >
                            {t('common.send_message')}
                          </button>
                        </div>
                      </div>
                      <div className="row g-3">
                        <div className="col-auto">
                          <div
                            className="teacher-avatar"
                            style={{
                              width: '80px',
                              height: '80px',
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
                                  fontSize: '28px',
                                  fontWeight: 'bold',
                                }}
                              >
                                {teacherName.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="col" style={{ paddingRight: '180px' }}>
                          <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                            <h5 className="mb-0 fw-bold" style={{ fontSize: '18px' }}>
                              {teacherName}
                            </h5>
                            <i className="fas fa-check-circle text-primary"></i>
                            {teacher.teacherProfile?.countryCode && (
                              <span style={{ fontSize: '20px' }} title={teacher.teacherProfile.country || ''}>
                                {getCountryFlag(teacher.teacherProfile.countryCode)}
                              </span>
                            )}
                          </div>
                          <div className="mb-2">
                            <span className="badge bg-primary me-2 small">{t('common.professional')}</span>
                            {teacher.teacherProfile?.rating >= 4.8 && (
                              <span className="badge" style={{ backgroundColor: '#ff6b9d', color: '#fff' }}>{t('common.super_tutor')}</span>
                            )}
                          </div>
                          {courseName && (
                            <div className="mb-2 small text-muted d-flex align-items-center gap-2">
                              <i className="fas fa-graduation-cap" style={{ fontSize: '14px', color: '#666' }}></i>
                              <span>{courseName}</span>
                            </div>
                          )}
                          <div className="mb-2 small text-muted d-flex align-items-center gap-2">
                            <i className="fas fa-language" style={{ fontSize: '14px', color: '#666' }}></i>
                            <span>{t('common.speaks')}: </span>
                            {languages.map((lang, idx) => {
                              let langName = '';
                              if (typeof lang === 'object' && lang !== null) {
                                langName = String(lang.nativeName || lang.name || '');
                              } else {
                                langName = String(lang || '');
                              }
                              return (
                                <span key={lang?._id || idx}>
                                  {langName}
                                  {idx < languages.length - 1 && ', '}
                                </span>
                              );
                            })}
                          </div>
                          {teacher.experience && (
                            <p className="small text-muted mb-2" style={{ lineHeight: '1.6' }}>
                              {teacher.experience}
                            </p>
                          )}
                          {teacher.bio && (
                            <div className="mb-2">
                              <p className="small text-muted mb-1" style={{ lineHeight: '1.6' }}>
                                {expandedBios.has(teacher._id)
                                  ? teacher.bio
                                  : teacher.bio.length > 200
                                  ? `${teacher.bio.substring(0, 200)}...`
                                  : teacher.bio}
                              </p>
                              {teacher.bio.length > 200 && (
                                <button
                                  className="btn btn-link p-0 text-primary"
                                  style={{ fontSize: '13px', textDecoration: 'none' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleBio(teacher._id);
                                  }}
                                >
                                  {expandedBios.has(teacher._id) ? t('common.show_less') : t('common.learn_more')}
                                </button>
                              )}
                            </div>
                          )}
                          {teacher.teacherProfile?.rating > 0 && (
                            <div className="d-flex align-items-center gap-3 small flex-wrap">
                              <div>
                                <i className="fas fa-star text-warning"></i>
                                <strong className="ms-1">{teacher.teacherProfile.rating.toFixed(1)}</strong>
                                <span className="text-muted ms-1">
                                  ({teacher.teacherProfile.totalReviews} {t('common.reviews')})
                                </span>
                              </div>
                              <span className="text-muted">
                                {teacher.teacherProfile.totalStudents} {t('common.students')}
                              </span>
                              {teacher.teacherProfile.experience > 0 && (
                                <span className="text-muted">
                                  {teacher.teacherProfile.experience} {t('common.years')} {t('common.experience')}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {isHovered && availabilityCount > 0 && (
                        <div
                          className="availability-popup mt-3 p-3 border rounded"
                          style={{
                            backgroundColor: '#f8f9fa',
                            position: 'absolute',
                            left: '0',
                            right: '0',
                            top: '100%',
                            zIndex: 10,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            marginTop: '8px',
                          }}
                          onMouseEnter={() => setHoveredTeacher(teacher._id)}
                          onMouseLeave={() => setHoveredTeacher(null)}
                        >
                          <h6 className="mb-2 fw-semibold">{t('common.available_slots')}:</h6>
                          <div className="d-flex flex-wrap gap-2">
                            {teacher.availability.slice(0, 8).map((slot) => (
                              <button
                                key={slot._id}
                                className="btn btn-outline-primary btn-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBookTrial(teacher);
                                }}
                                style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px' }}
                              >
                                {formatDate(slot.date)} {formatTime(slot.startTime)}
                              </button>
                            ))}
                            {availabilityCount > 8 && (
                              <button
                                className="btn btn-link btn-sm p-0 text-primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewSchedule(teacher);
                                }}
                                style={{ fontSize: '11px', textDecoration: 'none' }}
                              >
                                {t('common.view_full_schedule')} →
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="col-12 col-lg-4">
            {selectedTeacher && (
              <div className="teacher-video-sidebar" style={{ position: 'sticky', top: '20px' }}>
                <div className="card border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                  {selectedTeacher.introductionVideo ? (
                    <div className="position-relative">
                      <div
                        className="video-thumbnail"
                        style={{
                          width: '100%',
                          aspectRatio: '16/9',
                          backgroundColor: '#f8f9fa',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          position: 'relative',
                        }}
                        onClick={() => {
                          if (selectedTeacher.introductionVideo) {
                            window.open(selectedTeacher.introductionVideo, '_blank');
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
                            fontSize: '32px',
                            boxShadow: '0 4px 12px rgba(233, 30, 99, 0.4)',
                            zIndex: 2,
                            transition: 'transform 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
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
                            zIndex: 1,
                          }}
                        >
                          {t('common.watch_intro')}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="video-placeholder d-flex align-items-center justify-content-center"
                      style={{
                        width: '100%',
                        aspectRatio: '16/9',
                        backgroundColor: '#f8f9fa',
                      }}
                    >
                      <div className="text-center text-muted">
                        <i className="fas fa-video fa-3x mb-2"></i>
                        <p className="small mb-0">{t('common.no_video_available')}</p>
                      </div>
                    </div>
                  )}
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <h6 className="mb-0 fw-bold">
                        {typeof selectedTeacher.teacherId === 'object' ? selectedTeacher.teacherId.name : ''}
                      </h6>
                      <i className="fas fa-check-circle text-primary"></i>
                    </div>
                    <div className="d-flex flex-column gap-2">
                      <button
                        className="btn btn-outline-secondary w-100"
                        onClick={() => handleViewSchedule(selectedTeacher)}
                        style={{
                          borderRadius: '8px',
                          padding: '10px',
                          fontSize: '14px',
                          fontWeight: '500',
                        }}
                      >
                        {t('common.view_full_schedule')}
                      </button>
                      <button
                        className="btn btn-outline-secondary w-100"
                        onClick={() => {
                          const teacherId =
                            typeof selectedTeacher.teacherId === 'object' ? selectedTeacher.teacherId._id : '';
                          navigate(`/teacher/${teacherId}`);
                        }}
                        style={{
                          borderRadius: '8px',
                          padding: '10px',
                          fontSize: '14px',
                          fontWeight: '500',
                        }}
                      >
                        {t('common.see_teacher_profile')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
      {bookingTeacher && (
        <BookingModal
          teacher={bookingTeacher}
          courseId={typeof bookingTeacher.courseId === 'object' ? bookingTeacher.courseId._id : ''}
          isOpen={bookingModalOpen}
          onClose={() => {
            setBookingModalOpen(false);
            setBookingTeacher(null);
          }}
          onConfirm={handleBookingConfirm}
        />
      )}
    </>
  );
};

export default TeachersSelection;
