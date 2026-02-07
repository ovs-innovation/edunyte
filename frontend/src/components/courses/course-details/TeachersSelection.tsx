import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCourseTeachers, fetchCourses, fetchCourse, type TeacherCourse, type Course } from '../../../services/courseService';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { useWishlist } from '../../../contexts/WishlistContext';
import { useCurrency } from '../../../hooks/useCurrency';
import BookingModal from './BookingModal';
import * as Flags from 'country-flag-icons/react/3x2';
import countriesLib from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';

countriesLib.registerLocale(enLocale);

interface FilterState {
  priceRange: string;
  country: string;
  availability: string;
  sortBy: string;
  search: string;
  timeRanges: string[];
  days: string[];
  language: string;
}

const TeachersSelection = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { currency: selectedCurrency, convertPrice: convertPriceToSelected, formatPrice: formatPriceSelected } = useCurrency();
  const [teachers, setTeachers] = useState<TeacherCourse[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<TeacherCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherCourse | null>(null);
  const [hoveredTeacher, setHoveredTeacher] = useState<string | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingTeacher, setBookingTeacher] = useState<TeacherCourse | null>(null);
  const [expandedBios, setExpandedBios] = useState<Set<string>>(new Set());
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [languageSearch, setLanguageSearch] = useState('');
  const [displayPrices, setDisplayPrices] = useState<Record<string, { amount: number; formatted: string }>>({});
 
  const [filters, setFilters] = useState<FilterState>({
    priceRange: '',
    country: '',
    availability: '',
    sortBy: 'top_picks',
    search: '',
    timeRanges: [],
    days: [],
    language: '',
  });

  // Fetch specific course details
  useEffect(() => {
     if (!slug) return;
     const loadOneCourse = async () => {
        try {
           const { course } = await fetchCourse(slug as string);
           setCurrentCourse(course);
        } catch (error) {
           console.error("Failed to load course details:", error);
        }
     };
     loadOneCourse();
  }, [slug]);


  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await fetchCourses({ status: 'active' });
        setCourses(response.courses);
      } catch (err) {
        console.error('Failed to load courses:', err);
      }
    };
    loadCourses();
  }, [slug]);

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
    let cancelled = false;
    const loadDisplayPrices = async () => {
      if (!teachers || teachers.length === 0) {
        setDisplayPrices({});
        return;
      }
      try {
        const entries = await Promise.all(
          teachers.map(async (teacher) => {
            const usdAmount = typeof teacher.price === 'number' ? teacher.price : 0;
            const converted = await convertPriceToSelected(usdAmount, selectedCurrency);
            return [
              teacher._id,
              {
                amount: converted,
                formatted: formatPriceSelected(converted, selectedCurrency),
              },
            ] as const;
          })
        );
        if (!cancelled) {
          setDisplayPrices(Object.fromEntries(entries));
        }
      } catch (err) {
        console.error('Failed to convert teacher prices:', err);
        if (!cancelled) {
          setDisplayPrices({});
        }
      }
    };
    loadDisplayPrices();
    return () => {
      cancelled = true;
    };
  }, [teachers, selectedCurrency, convertPriceToSelected, formatPriceSelected]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.course-dropdown-container') && !target.closest('.country-dropdown-container') && !target.closest('.language-dropdown-container')) {
        setCourseDropdownOpen(false);
        setCountryDropdownOpen(false);
        setLanguageDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    let filtered = [...teachers];
    const getComparablePrice = (teacher: TeacherCourse) => {
      const mapped = displayPrices[teacher._id]?.amount;
      return typeof mapped === 'number' && !isNaN(mapped) ? mapped : (teacher.price || 0);
    };

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
        const price = getComparablePrice(teacher);
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

    if (filters.language) {
      filtered = filtered.filter((teacher) => {
        return teacher.languageIds?.some((lang) => lang._id === filters.language || lang.name === filters.language);
      });
    }

    if (filters.availability === 'available') {
      filtered = filtered.filter((teacher) => {
        return teacher.availability && teacher.availability.length > 0;
      });
    }

    if (filters.timeRanges.length > 0 || filters.days.length > 0) {
      const studentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const getSlotInstant = (date: string | Date, time: string, timezone: string) => {
        try {
          const dateObj = typeof date === 'string' ? new Date(date) : date;
          if (isNaN(dateObj.getTime())) return null;
          const [hours, minutes] = time.split(':');
          const dateStr = new Intl.DateTimeFormat('en-CA', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }).format(dateObj);
          const dateTimeStr = `${dateStr}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
          const tempDate = new Date(dateTimeStr);

          const fromDateStr = tempDate.toLocaleString('en-US', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          });

          return new Date(
            fromDateStr.replace(
              /(\d+)\/(\d+)\/(\d+), (\d+):(\d+):(\d+)/,
              '$3-$1-$2T$4:$5:$6'
            )
          );
        } catch (err) {
          console.error('Timezone conversion error:', err);
          return null;
        }
      };

      const getStudentDayName = (instant: Date) => {
        return new Intl.DateTimeFormat('en-US', {
          weekday: 'short',
          timeZone: studentTimezone,
        }).format(instant);
      };

      const getStudentHour = (instant: Date) => {
        const hourStr = new Intl.DateTimeFormat('en-US', {
          hour: '2-digit',
          hour12: false,
          timeZone: studentTimezone,
        }).format(instant);
        return parseInt(hourStr, 10);
      };

      filtered = filtered.filter((teacher) => {
        if (!teacher.availability || teacher.availability.length === 0) return false;

        return teacher.availability.some((slot) => {
          try {
            const slotTimezone = slot.timezone || teacher.timezone || 'UTC';
            const instant = getSlotInstant(slot.date, slot.startTime, slotTimezone);
            if (!instant) return false;

            const dayName = getStudentDayName(instant);

            let matchesDay = true;
            if (filters.days.length > 0) {
              matchesDay = filters.days.includes(dayName);
            }

            let matchesTime = true;
            if (filters.timeRanges.length > 0) {
              const hour = getStudentHour(instant);
              matchesTime = filters.timeRanges.some((range) => {
                const [start, end] = range.split('-').map(Number);
                return hour >= start && hour < end;
              });
            }

            return matchesDay && matchesTime;
          } catch (err) {
            console.error('Error filtering slot:', err, slot);
            return false;
          }
        });
      });
    }

    switch (filters.sortBy) {
      case 'price_low':
        filtered.sort((a, b) => getComparablePrice(a) - getComparablePrice(b));
        break;
      case 'price_high':
        filtered.sort((a, b) => getComparablePrice(b) - getComparablePrice(a));
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
  }, [filters, teachers, selectedTeacher, displayPrices]);

  const getFormattedTeacherPrice = (teacher: TeacherCourse) => {
    const mapped = displayPrices[teacher._id]?.formatted;
    if (mapped) return mapped;
    const usdAmount = typeof teacher.price === 'number' ? teacher.price : 0;
    return formatPriceSelected(usdAmount, selectedCurrency);
  };

  const CountryFlag = ({ code }: { code: string }) => {
    if (!code) return null;
    
    try {
      const upperCode = code.toUpperCase();
      const FlagComponent = (Flags as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>>)[upperCode];
      if (FlagComponent) {
        return <FlagComponent style={{ width: '24px', height: '18px', borderRadius: '2px', objectFit: 'cover' }} />;
      }
    } catch (error) {
      console.error('Error rendering flag:', error);
    }
    
    return <span style={{ fontSize: '12px', color: '#666' }}>{code}</span>;
  };

  const getYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const getYouTubeThumbnail = (url: string): string => {
    const videoId = getYouTubeVideoId(url);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return '';
  };





  const getPriceRanges = () => {
    if (teachers.length === 0) return [];
    const prices = teachers
      .map((t) => displayPrices[t._id]?.amount ?? (t.price || 0))
      .filter((p) => typeof p === 'number' && !isNaN(p) && p > 0);
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

  const getCountryName = (code: string): string => {
    if (!code) return '';
    try {
      const name = countriesLib.getName(code.toUpperCase(), 'en');
      return name || code;
    } catch {
      return code;
    }
  };

  const getCountries = () => {
    const countries = new Set<string>();
    teachers.forEach((teacher) => {
      if (teacher.teacherProfile?.countryCode) {
        countries.add(teacher.teacherProfile.countryCode);
      }
    });
    return Array.from(countries).sort();
  };

  const languageDisplayNames =
    typeof Intl !== 'undefined' && (Intl as any).DisplayNames
      ? new (Intl as any).DisplayNames(['en'], { type: 'language' })
      : null;

  const formatLanguageLabel = (lang: { _id?: string; name?: string; code?: string; nativeName?: string }) => {
    if (!lang) return '';
    const code = (lang.code || '').toString().toUpperCase();
    let label = (lang.nativeName || lang.name || '').toString().trim();

    // If label is missing or just the code, try to resolve via Intl.DisplayNames
    if ((!label || label.toUpperCase() === code) && languageDisplayNames && code) {
      try {
        const resolved = languageDisplayNames.of(code.toLowerCase());
        if (resolved) {
          label = resolved.toString();
        }
      } catch {
        // ignore and fall back
      }
    }

    if (!label) {
      label = code || '';
    }

    // Append code in parentheses for clarity
    if (code && !label.toLowerCase().includes(`(${code.toLowerCase()}`)) {
      return `${label} (${code})`;
    }

    return label;
  };

  const getLanguages = () => {
    const languageMap = new Map<string, { _id: string; name?: string; code?: string; nativeName?: string }>();
    teachers.forEach((teacher) => {
      if (teacher.languageIds) {
        teacher.languageIds.forEach((lang) => {
          if (!languageMap.has(lang._id)) {
            languageMap.set(lang._id, lang);
          }
        });
      }
    });
    return Array.from(languageMap.values()).sort((a, b) => formatLanguageLabel(a).localeCompare(formatLanguageLabel(b)));
  };

  const popularLanguages = ['Hindi', 'Tamil', 'Telugu', 'Kannada', 'Marathi', 'English'];

  const handleBookTrial = (teacher: TeacherCourse) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setBookingTeacher(teacher);
    setBookingModalOpen(true);
  };

  const handleBookingConfirm = (bookingData: any) => {
    // Next step: Pricing & Checkout (Stripe)
    navigate(`/booking/checkout`, { state: bookingData });
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
    e.preventDefault();
    toggleWishlist(teacherId);
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
  const languages = getLanguages();

  return (
    <>
      <style>{`
        .teachers-selection-page .filters-bar .form-control:focus,
        .teachers-selection-page .filters-bar .form-select:focus {
          border-color: #e91e63 !important;
          box-shadow: 0 0 0 3px rgba(233, 30, 99, 0.1) !important;
          outline: none !important;
        }

        @media (max-width: 992px) {
          .teachers-selection-page .price-wishlist-section-desktop,
          .teachers-selection-page .action-buttons-section-desktop {
            display: none !important;
          }
          .teachers-selection-page .price-buttons-mobile {
            display: flex !important;
          }
        }

        @media (min-width: 993px) {
          .teachers-selection-page .price-wishlist-section-desktop,
          .teachers-selection-page .action-buttons-section-desktop {
            display: block !important;
          }
          .teachers-selection-page .price-buttons-mobile {
            display: none !important;
          }
        }

        @media (max-width: 576px) {
          .teachers-selection-page .container {
            padding: 12px 16px 16px 16px !important;
          }
          .teachers-selection-page h1 {
            font-size: 20px !important;
            margin-bottom: 16px !important;
            line-height: 1.3 !important;
          }
          .teachers-selection-page .filters-bar {
            flex-direction: column !important;
            padding: 12px !important;
            gap: 10px !important;
            border-radius: 8px !important;
            margin-bottom: 16px !important;
          }
          .teachers-selection-page .filter-item {
            width: 100% !important;
            min-width: 100% !important;
            flex: 1 1 100% !important;
          }
          .teachers-selection-page .filter-item .form-select,
          .teachers-selection-page .filter-item .form-control {
            min-height: 44px !important;
            font-size: 14px !important;
            padding: 10px 12px !important;
          }
          .teachers-selection-page .teacher-card {
            padding: 16px !important;
            margin-bottom: 16px !important;
          }
          .teachers-selection-page .teacher-card .row.g-3 {
            margin: 0 !important;
          }
          .teachers-selection-page .teacher-card .row.g-3 > div {
            padding: 0 !important;
            margin-bottom: 12px !important;
          }
          .teachers-selection-page .teacher-card .teacher-content-col {
            padding-right: 0 !important;
            padding-left: 0 !important;
          }
          .teachers-selection-page .teacher-card .border-top {
            margin-top: 12px !important;
            padding-top: 12px !important;
          }
          .teachers-selection-page .teacher-card .d-flex.justify-content-between {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .teachers-selection-page .teacher-card .d-flex.justify-content-between > div:first-child {
            width: 100% !important;
            justify-content: space-between !important;
          }
          .teachers-selection-page .teacher-card .d-flex.flex-column {
            width: 100% !important;
          }
          .teachers-selection-page .teacher-card .availability-popup {
            position: relative !important;
            left: 0 !important;
            right: 0 !important;
            top: 0 !important;
            margin-top: 12px !important;
            margin-bottom: 0 !important;
          }
          .teachers-selection-page .col-lg-8,
          .teachers-selection-page .col-lg-4 {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          .teachers-selection-page .teacher-video-sidebar {
            display: none !important;
          }
          .teachers-selection-page .language-dropdown-container > div[style*="position: absolute"],
          .teachers-selection-page .country-dropdown-container > div[style*="position: absolute"],
          .teachers-selection-page .course-dropdown-container > div[style*="position: absolute"] {
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
          }
        }

        @media (min-width: 577px) and (max-width: 768px) {
          .teachers-selection-page .container {
            padding: 12px 16px 20px 16px !important;
          }
          .teachers-selection-page h1 {
            font-size: 24px !important;
            margin-bottom: 16px !important;
          }
          .teachers-selection-page .filters-bar {
            flex-wrap: wrap !important;
            gap: 10px !important;
            padding: 14px !important;
            margin-bottom: 16px !important;
          }
          .teachers-selection-page .filter-item {
            flex: 1 1 calc(50% - 5px) !important;
            min-width: calc(50% - 5px) !important;
          }
          .teachers-selection-page .filter-item:first-child {
            flex: 1 1 100% !important;
            min-width: 100% !important;
          }
          .teachers-selection-page .teacher-card {
            padding: 18px !important;
          }
          .teachers-selection-page .teacher-card .teacher-content-col {
            padding-right: 0 !important;
          }
          .teachers-selection-page .teacher-video-sidebar {
            display: none !important;
          }
        }

        @media (min-width: 769px) and (max-width: 992px) {
          .teachers-selection-page .container {
            padding: 14px 18px 20px 18px !important;
          }
          .teachers-selection-page .teacher-video-sidebar {
            position: relative !important;
            top: 0 !important;
            margin-top: 20px !important;
          }
          .teachers-selection-page .teacher-card .teacher-content-col {
            padding-right: 0 !important;
          }
        }

        @media (min-width: 993px) {
          .teachers-selection-page .container {
            padding: 16px 20px 20px 20px !important;
          }
        }
      `}</style>
      <div className="teachers-selection-page" style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
        <div className="container" style={{ maxWidth: '1400px', padding: '16px 20px 20px 20px' }}>
          <div className="row mb-3">
            <div className="col-12">
              <h1 className="h2 fw-bold mb-2" style={{ fontSize: '32px', color: '#1a1a1a', lineHeight: '1.2' }}>
                {filteredTeachers.length} {t('common.available_teachers')} {t('common.to_help_you_succeed')}
              </h1>
            </div>
          </div>

        <div className="row mb-3">
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
              <div className="filter-item course-dropdown-container" style={{ flex: '0 1 auto', minWidth: '200px', position: 'relative' }}>
                <div
                  className="form-select"
                  onClick={() => {
                    setCourseDropdownOpen(!courseDropdownOpen);
                    setCountryDropdownOpen(false);
                    setLanguageDropdownOpen(false);
                  }}
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    padding: '10px 16px',
                    fontSize: '14px',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minHeight: '42px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0, overflow: 'hidden' }}>
                    {currentCourse ? (
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <i className="fas fa-graduation-cap" style={{ marginRight: '8px', color: '#666' }}></i>
                        {currentCourse.name}
                      </span>
                    ) : (
                      <span style={{ color: '#999' }}>
                        <i className="fas fa-graduation-cap" style={{ marginRight: '8px', color: '#999' }}></i>
                        {t('common.select_course')}
                      </span>
                    )}
                  </div>
                </div>
                {courseDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '4px',
                      backgroundColor: '#fff',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      zIndex: 1001,
                      maxHeight: '300px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div style={{ padding: '8px', borderBottom: '1px solid #e0e0e0' }}>
                      <input
                        type="text"
                        placeholder="Type to search..."
                        value={courseSearch}
                        onChange={(e) => setCourseSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #e0e0e0',
                          borderRadius: '6px',
                          fontSize: '14px',
                        }}
                      />
                    </div>
                    <div style={{ overflowY: 'auto', maxHeight: '250px' }}>
                      {courses
                        .filter((course) => {
                          if (!courseSearch) return true;
                          const name = (course.name || '').toLowerCase();
                          return name.includes(courseSearch.toLowerCase());
                        })
                        .map((course) => (
                          <div
                            key={course._id}
                            onClick={() => {
                              if (course.slug && course.slug !== slug) {
                                navigate(`/course/${course.slug}`);
                              }
                              setCourseDropdownOpen(false);
                              setCourseSearch('');
                            }}
                            style={{
                              padding: '12px 16px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              backgroundColor: currentCourse?._id === course._id ? '#f5f5f5' : 'transparent',
                              borderBottom: '1px solid #f0f0f0',
                            }}
                            onMouseEnter={(e) => {
                              if (currentCourse?._id !== course._id) {
                                e.currentTarget.style.backgroundColor = '#f5f5f5';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (currentCourse?._id !== course._id) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }
                            }}
                          >
                            <i className="fas fa-graduation-cap" style={{ color: '#666', fontSize: '14px' }}></i>
                            <span style={{ fontSize: '14px', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.name}</span>
                            {currentCourse?._id === course._id && (
                              <i className="fas fa-check" style={{ color: '#e91e63', fontSize: '12px', flexShrink: 0 }}></i>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="filter-item search-input-container" style={{ position: 'relative', flex: '1 1 200px', minWidth: '200px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder={t('common.search_by_name')}
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    padding: '10px 40px 10px 16px',
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
                    fontSize: '14px',
                  }}
                />
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
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    paddingRight: '16px',
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
              <div className="filter-item country-dropdown-container" style={{ flex: '0 1 auto', minWidth: '180px', position: 'relative' }}>
                <div
                  className="form-select"
                  onClick={() => {
                    setCountryDropdownOpen(!countryDropdownOpen);
                    setCourseDropdownOpen(false);
                    setLanguageDropdownOpen(false);
                  }}
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    padding: '10px 16px',
                    fontSize: '14px',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minHeight: '42px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0, overflow: 'hidden' }}>
                    {filters.country ? (
                      <>
                        <CountryFlag code={filters.country} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getCountryName(filters.country)}</span>
                      </>
                    ) : (
                      <span style={{ color: '#999' }}>{t('common.any_country')}</span>
                    )}
                  </div>
                </div>
                {countryDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '4px',
                      backgroundColor: '#fff',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      zIndex: 1000,
                      maxHeight: '300px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div style={{ padding: '8px', borderBottom: '1px solid #e0e0e0' }}>
                      <input
                        type="text"
                        placeholder="Type to search..."
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #e0e0e0',
                          borderRadius: '6px',
                          fontSize: '14px',
                        }}
                      />
                    </div>
                    <div style={{ overflowY: 'auto', maxHeight: '250px' }}>
                      <div
                        onClick={() => {
                          setFilters({ ...filters, country: '' });
                          setCountryDropdownOpen(false);
                          setCountrySearch('');
                        }}
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          backgroundColor: filters.country === '' ? '#f5f5f5' : 'transparent',
                          borderBottom: '1px solid #f0f0f0',
                        }}
                        onMouseEnter={(e) => {
                          if (filters.country !== '') {
                            e.currentTarget.style.backgroundColor = '#f5f5f5';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (filters.country !== '') {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <span style={{ color: '#999', fontSize: '14px' }}>{t('common.any_country')}</span>
                      </div>
                      {countries
                        .filter((country) => {
                          if (!countrySearch) return true;
                          const name = getCountryName(country).toLowerCase();
                          const code = country.toLowerCase();
                          return name.includes(countrySearch.toLowerCase()) || code.includes(countrySearch.toLowerCase());
                        })
                        .map((country) => (
                          <div
                            key={country}
                            onClick={() => {
                              setFilters({ ...filters, country });
                              setCountryDropdownOpen(false);
                              setCountrySearch('');
                            }}
                            style={{
                              padding: '12px 16px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              backgroundColor: filters.country === country ? '#f5f5f5' : 'transparent',
                              borderBottom: '1px solid #f0f0f0',
                            }}
                            onMouseEnter={(e) => {
                              if (filters.country !== country) {
                                e.currentTarget.style.backgroundColor = '#f5f5f5';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (filters.country !== country) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }
                            }}
                          >
                            <CountryFlag code={country} />
                            <span style={{ fontSize: '14px', flex: 1 }}>{getCountryName(country)}</span>
                            {filters.country === country && (
                              <i className="fas fa-check" style={{ color: '#e91e63', fontSize: '12px' }}></i>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="filter-item language-dropdown-container" style={{ flex: '0 1 auto', minWidth: '160px', position: 'relative' }}>
                <div
                  className="form-select"
                  onClick={() => {
                    setLanguageDropdownOpen(!languageDropdownOpen);
                    setCourseDropdownOpen(false);
                    setCountryDropdownOpen(false);
                  }}
                  style={{
                    borderRadius: '8px',
                    border: filters.language ? '1px solid #e91e63' : '1px solid #e0e0e0',
                    padding: '10px 16px',
                    fontSize: '14px',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minHeight: '42px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0, overflow: 'hidden' }}>
                    {filters.language ? (
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {(() => {
                        const lang = languages.find(
                          (l) => l._id === filters.language || formatLanguageLabel(l) === filters.language
                        );
                        return lang ? formatLanguageLabel(lang) : filters.language || 'Also speaks';
                      })()}
                    </span>
                    ) : (
                      <span style={{ color: '#999' }}>Also speaks</span>
                    )}
                  </div>
                </div>
                {languageDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '4px',
                      backgroundColor: '#fff',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      zIndex: 1000,
                      maxHeight: '400px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div style={{ padding: '8px', borderBottom: '1px solid #e0e0e0' }}>
                      <div style={{ position: 'relative' }}>
                        <i className="fas fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999', fontSize: '14px' }}></i>
                        <input
                          type="text"
                          placeholder="Type to search"
                          value={languageSearch}
                          onChange={(e) => setLanguageSearch(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            width: '100%',
                            padding: '8px 12px 8px 36px',
                            border: '1px solid #e0e0e0',
                            borderRadius: '6px',
                            fontSize: '14px',
                          }}
                        />
                      </div>
                    </div>
                    <div style={{ overflowY: 'auto', maxHeight: '350px' }}>
                      <div
                        onClick={() => {
                          setFilters({ ...filters, language: '' });
                          setLanguageDropdownOpen(false);
                          setLanguageSearch('');
                        }}
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          backgroundColor: filters.language === '' ? '#f5f5f5' : 'transparent',
                          borderBottom: '1px solid #f0f0f0',
                        }}
                        onMouseEnter={(e) => {
                          if (filters.language !== '') {
                            e.currentTarget.style.backgroundColor = '#f5f5f5';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (filters.language !== '') {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <span style={{ color: '#999', fontSize: '14px' }}>All languages</span>
                      </div>
                      {languages.filter((lang) => {
                        if (!languageSearch) return true;
                        const searchLower = languageSearch.toLowerCase();
                        const name = (lang.name || '').toString().toLowerCase();
                        const nativeName = (lang.nativeName || '').toString().toLowerCase();
                        const code = (lang.code || '').toString().toLowerCase();
                        return (
                          name.includes(searchLower) ||
                          nativeName.includes(searchLower) ||
                          code.includes(searchLower)
                        );
                      }).length > 0 && (
                        <>
                          {popularLanguages.length > 0 && (
                            <>
                              <div style={{ padding: '12px 16px 8px', fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>Popular</div>
                              {languages
                                .filter((lang) => {
                                  const langName = (lang.name || '').toString();
                                  if (!popularLanguages.includes(langName)) return false;
                                  if (!languageSearch) return true;
                                  const searchLower = languageSearch.toLowerCase();
                                  const name = (lang.name || '').toString().toLowerCase();
                                  const nativeName = (lang.nativeName || '').toString().toLowerCase();
                                  const code = (lang.code || '').toString().toLowerCase();
                                  return (
                                    name.includes(searchLower) ||
                                    nativeName.includes(searchLower) ||
                                    code.includes(searchLower)
                                  );
                                })
                                .map((lang) => (
                                  <div
                                    key={lang._id}
                                    onClick={() => {
                                      setFilters({ ...filters, language: lang._id });
                                      setLanguageDropdownOpen(false);
                                      setLanguageSearch('');
                                    }}
                                    style={{
                                      padding: '12px 16px',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '10px',
                                      backgroundColor: filters.language === lang._id ? '#f5f5f5' : 'transparent',
                                      borderBottom: '1px solid #f0f0f0',
                                    }}
                                    onMouseEnter={(e) => {
                                      if (filters.language !== lang._id) {
                                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (filters.language !== lang._id) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                      }
                                    }}
                                  >
                                    <span style={{ fontSize: '14px', flex: 1 }}>{formatLanguageLabel(lang)}</span>
                                    {filters.language === lang._id && (
                                      <i className="fas fa-check" style={{ color: '#e91e63', fontSize: '12px' }}></i>
                                    )}
                                  </div>
                                ))}
                            </>
                          )}
                          {languages
                            .filter((lang) => {
                              const langName = (lang.name || '').toString();
                              if (popularLanguages.includes(langName)) return false;
                              if (!languageSearch) return true;
                              const searchLower = languageSearch.toLowerCase();
                              const name = (lang.name || '').toString().toLowerCase();
                              const nativeName = (lang.nativeName || '').toString().toLowerCase();
                              const code = (lang.code || '').toString().toLowerCase();
                              return (
                                name.includes(searchLower) ||
                                nativeName.includes(searchLower) ||
                                code.includes(searchLower)
                              );
                            })
                            .map((lang) => (
                              <div
                                key={lang._id}
                                onClick={() => {
                                  setFilters({ ...filters, language: lang._id });
                                  setLanguageDropdownOpen(false);
                                  setLanguageSearch('');
                                }}
                                style={{
                                  padding: '12px 16px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  backgroundColor: filters.language === lang._id ? '#f5f5f5' : 'transparent',
                                  borderBottom: '1px solid #f0f0f0',
                                }}
                                onMouseEnter={(e) => {
                                  if (filters.language !== lang._id) {
                                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (filters.language !== lang._id) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                  }
                                }}
                              >
                                    <span style={{ fontSize: '14px', flex: 1 }}>{formatLanguageLabel(lang)}</span>
                                {filters.language === lang._id && (
                                  <i className="fas fa-check" style={{ color: '#e91e63', fontSize: '12px' }}></i>
                                )}
                              </div>
                            ))}
                        </>
                      )}
                    </div>
                  </div>
                )}
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
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    paddingRight: '16px',
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
                  const languages =
                    Array.isArray((teacher as any).languages) && (teacher as any).languages.length > 0
                      ? (teacher as any).languages
                      : Array.isArray(teacher.languageIds)
                        ? teacher.languageIds
                        : [];
                  const courseId = typeof teacher.courseId === 'object' ? teacher.courseId : null;
                  let courseName = '';
                  if (courseId && courseId.name) {
                    if (typeof courseId.name === 'string') {
                      courseName = courseId.name;
                    } else if (typeof courseId.name === 'object' && courseId.name !== null) {
                      courseName = (courseId.name as any).en || String(courseId.name);
                    }
                  }
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
                      <div className="position-absolute price-wishlist-section-desktop" style={{ top: '20px', right: '20px', zIndex: 2, maxWidth: '200px' }}>
                        <div className="d-flex align-items-center justify-content-end" style={{ gap: '6px' }}>
                          <span className="fw-bold text-primary" style={{ fontSize: '20px', lineHeight: '1' }}>
                            {getFormattedTeacherPrice(teacher)}
                          </span>
                          <span className="text-muted" style={{ fontSize: '14px', lineHeight: '1' }}>
                            / {t('common.hour')}
                          </span>
                        </div>
                      </div>

                      <div 
                        className="position-absolute action-buttons-section-desktop" 
                        style={{ 
                          top: '70px', 
                          right: '20px', 
                          zIndex: 2,
                          minWidth: '160px',
                        }}
                      >
                        <div className="d-flex flex-column align-items-end gap-2">
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
                        <div className="col teacher-content-col" style={{ paddingRight: '200px' }}>
                          <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                            <h5 className="mb-0 fw-bold" style={{ fontSize: '18px' }}>
                              {teacherName}
                            </h5>
                            <i className="fas fa-check-circle text-primary"></i>
                            {teacher.teacherProfile?.countryCode && (
                              <span title={teacher.teacherProfile.country || teacher.teacherProfile.countryCode} style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '4px' }}>
                                <CountryFlag code={teacher.teacherProfile.countryCode} />
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
                            {languages.map(
                              (
                                lang: { _id?: string; name?: string; code?: string; nativeName?: string; proficiency?: string },
                                idx: number
                              ) => {
                                const code = (lang.code || '').toString().toUpperCase();
                                let label = (lang.nativeName || lang.name || '').toString().trim();
                                
                                if ((!label || label.toUpperCase() === code) && languageDisplayNames && code) {
                                  try {
                                    const resolved = languageDisplayNames.of(code.toLowerCase());
                                    if (resolved) label = resolved.toString();
                                  } catch {}
                                }
                                if (!label) label = code;

                                const proficiency = lang.proficiency;
                                let profLabel = '';
                                if (proficiency) {
                                  const value = proficiency.toLowerCase();
                                  if (value === 'native') profLabel = 'Native';
                                  else if (value === 'c2') profLabel = 'Proficient';
                                  else if (value === 'c1') profLabel = 'Advanced';
                                  else if (value === 'b2') profLabel = 'Upper Intermediate';
                                  else if (value === 'b1') profLabel = 'Intermediate';
                                  else if (value === 'a2') profLabel = 'Elementary';
                                  else if (value === 'a1') profLabel = 'Beginner';
                                  else profLabel = proficiency; 
                                }
                                
                                const fullLabel = profLabel ? `${label} (${profLabel})` : label;
                                return (
                                  <span key={lang._id || idx}>
                                    {fullLabel}
                                    {idx < languages.length - 1 && ', '}
                                  </span>
                                );
                              }
                            )}
                          </div>
                          {teacher.bio && (
                            <div className="mb-2">
                              <p className="small text-muted mb-1" style={{ lineHeight: '1.6' }}>
                                {expandedBios.has(teacher._id)
                                  ? teacher.bio
                                  : teacher.bio.length > 110
                                  ? `${teacher.bio.substring(0, 110)}...`
                                  : teacher.bio}
                              </p>
                              {teacher.bio.length > 110 && (
                                <button
                                  className="p-0 border-0 bg-transparent"
                                  style={{ fontSize: '13px', textDecoration: 'none', color: '#0056b3', cursor: 'pointer', outline: 'none', boxShadow: 'none' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleBio(teacher._id);
                                  }}
                                >
                                  {expandedBios.has(teacher._id) ? t('common.show_less') : t('common.show_more') || 'Show more'}
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
                              {/* Mobile Price Display in Stats Row */}
                              <div className="d-lg-none d-flex align-items-center gap-1 ms-auto">
                                <span className="fw-bold text-primary" style={{ fontSize: '16px' }}>
                                  {getFormattedTeacherPrice(teacher)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-top price-buttons-mobile d-flex align-items-center gap-3">
                        <button
                          className="btn btn-sm d-flex align-items-center justify-content-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendMessage(teacher);
                          }}
                          style={{
                            backgroundColor: '#fff',
                            borderColor: '#ddd',
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            width: '42px',
                            height: '42px',
                            borderRadius: '8px',
                            color: '#1a1a1a',
                            padding: 0,
                            flexShrink: 0,
                          }}
                        >
                          <i className="far fa-comment-dots" style={{ fontSize: '18px' }}></i>
                        </button>
                        <button
                          className="btn btn-sm flex-grow-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookTrial(teacher);
                          }}
                          style={{
                            backgroundColor: '#e91e63',
                            borderColor: '#e91e63',
                            fontSize: '14px',
                            height: '42px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            color: '#fff',
                          }}
                        >
                          {t('common.book_trial_lesson')}
                        </button>
                      </div>
                      
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="col-12 col-lg-4">
            {(() => {
              const activeTeacherId = hoveredTeacher || (selectedTeacher?._id);
              const activeTeacher = activeTeacherId ? filteredTeachers.find(t => t._id === activeTeacherId) : null;
              
              if (!activeTeacher) return null;
              
              return (
                <div className="teacher-video-sidebar" style={{ position: 'sticky', top: '20px' }}>
                  <div className="card border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                    {activeTeacher.introductionVideo ? (
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
                          if (activeTeacher.introductionVideo) {
                            setVideoUrl(activeTeacher.introductionVideo);
                            setVideoModalOpen(true);
                          }
                        }}
                      >
                        {getYouTubeThumbnail(activeTeacher.introductionVideo) ? (
                          <img
                            src={getYouTubeThumbnail(activeTeacher.introductionVideo)}
                                alt="Video thumbnail"
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : null}
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
                            {typeof activeTeacher.teacherId === 'object' ? activeTeacher.teacherId.name : ''}
                          </h6>
                          <i className="fas fa-check-circle text-primary"></i>
                        </div>
                        <div className="d-flex flex-column gap-2">
                          <button
                            className="btn btn-outline-secondary w-100"
                            onClick={() => handleViewSchedule(activeTeacher)}
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
                                typeof activeTeacher.teacherId === 'object' ? activeTeacher.teacherId._id : '';
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
                );
              })()}
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
      {videoModalOpen && (
        <div
          className="modal fade show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999 }}
          onClick={() => setVideoModalOpen(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '900px' }}
          >
            <div className="modal-content" style={{ borderRadius: '16px', border: 'none', backgroundColor: 'transparent' }}>
              <div className="modal-header border-0 pb-0" style={{ padding: '0', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setVideoModalOpen(false)}
                  aria-label="Close"
                  style={{
                    fontSize: '24px',
                    opacity: 1,
                    filter: 'brightness(0) invert(1)',
                    width: '40px',
                    height: '40px',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    borderRadius: '50%',
                  }}
                ></button>
              </div>
              <div className="modal-body p-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                {getYouTubeVideoId(videoUrl) ? (
                  <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeVideoId(videoUrl)}?autoplay=1`}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: 'none',
                      }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <div
                    style={{
                      width: '100%',
                      aspectRatio: '16/9',
                      backgroundColor: '#000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                    }}
                  >
                    <p>Video URL is not supported</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TeachersSelection;
