import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../../contexts/AuthContext'
import { getMyBookings, Booking, cancelBooking, getAvailableSlots, rescheduleBooking } from '../../../services/bookingService'
import DashboardBannerTwo from '../../dashboard-common/DashboardBannerTwo'
import DashboardSidebarTwo from '../../dashboard-common/DashboardSidebarTwo'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { toast } from 'react-toastify'

const localizer = momentLocalizer(moment)

const StudentDashboardArea = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { token } = useAuth() as any
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming')
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  
  // Reschedule States
  const [rescheduleBookingId, setRescheduleBookingId] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId && !(event.target as Element).closest('.booking-action-menu')) {
        setOpenDropdownId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openDropdownId])

  const fetchBookings = async () => {
      if (!token) return
      try {
        setLoading(true)
        const data = await getMyBookings(token)
        setBookings(data)
      } catch (err: any) {
        setError(err.message || t('common.error_loading_data'))
      } finally {
        setLoading(false)
      }
    }

  useEffect(() => {
    fetchBookings()
  }, [token, t])

  const handleBookingCancel = async (bookingId: string, scheduledAt: string) => {
     setOpenDropdownId(null);
     
     // Optimistic 24h check
     const lessonDate = new Date(scheduledAt);
     const now = new Date();
     const hoursDiff = (lessonDate.getTime() - now.getTime()) / (1000 * 60 * 60);
     
     if (hoursDiff < 24) {
        toast.error('Lessons can only be cancelled at least 24 hours in advance.');
        return;
     }

     if (window.confirm(t('common.are_you_sure') + ' ' + t('common.booking_cancelled_propmt', { defaultValue: "You won't be able to revert this!"}))) {
        try {
           await cancelBooking(bookingId, token);
           toast.success(t('common.booking_cancelled_success'));
           fetchBookings(); // Refresh data
        } catch (err: any) {
           toast.error(err.message || t('common.action_failed'));
        }
     }
  };

  const handleReschedule = async (bookingId: string) => {
     setOpenDropdownId(null);
     const booking = bookings.find(b => b._id === bookingId);
     if (!booking) return;

     // Check 24h rule locally first
     const lessonDate = new Date(booking.lesson?.scheduledAt || booking.sessionDate);
     const now = new Date();
     const hoursDiff = (lessonDate.getTime() - now.getTime()) / (1000 * 60 * 60);
     if (hoursDiff < 24) {
        toast.error('Rescheduling is only allowed at least 24 hours in advance.');
        return;
     }

     setRescheduleBookingId(bookingId);
     setLoadingSlots(true);
     setAvailableSlots([]);
     setSelectedSlotId(null);

     try {
       // We need teacherCourseId. 
       // If booking model has it populated, we needs its _id.
       const tcId = typeof booking.teacherCourseId === 'object' 
          ? (booking.teacherCourseId as any)._id 
          : booking.teacherCourseId;
          
       const slots = await getAvailableSlots(tcId, token);
       // Filter for same duration? Ideally backend handles invalid slots, but we should show relevant ones.
       setAvailableSlots(slots);
     } catch (err: any) {
       toast.error(err.message || 'Failed to fetch available slots');
       setRescheduleBookingId(null); // Close modal on error
     } finally {
       setLoadingSlots(false);
     }
  };

  const handleConfirmReschedule = async () => {
    if (!rescheduleBookingId || !selectedSlotId) return;

    setIsRescheduling(true);
    try {
      await rescheduleBooking(rescheduleBookingId, selectedSlotId, token);
      toast.success('Lesson rescheduled successfully!');
      setRescheduleBookingId(null);
      fetchBookings();
    } catch (err: any) {
      toast.error(err.message || 'Failed to reschedule lesson');
    } finally {
      setIsRescheduling(false);
    }
  };

  const closeRescheduleModal = () => {
    setRescheduleBookingId(null);
    setAvailableSlots([]);
    setSelectedSlotId(null);
  };

  const handleShareLink = async (booking: Booking) => {
    setOpenDropdownId(null);
    const meetingUrl = booking.meeting?.joinUrlStudent;
    
    if (!meetingUrl) {
      toast.error('No meeting link available to share');
      return;
    }

    try {
      await navigator.clipboard.writeText(meetingUrl);
      toast.success('Meeting link copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = meetingUrl;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success('Meeting link copied to clipboard!');
      } catch (e) {
        toast.error('Failed to copy link');
      }
      document.body.removeChild(textArea);
    }
  };



  const now = new Date()
  const upcomingBookings = bookings.filter(b => {
    const lessonDate = b.lesson?.scheduledAt ? new Date(b.lesson.scheduledAt) : new Date(b.sessionDate);
    return lessonDate > now && b.paymentStatus === 'paid' && b.status !== 'cancelled'
  }).sort((a, b) => {
     const dateA = a.lesson?.scheduledAt ? new Date(a.lesson.scheduledAt) : new Date(a.sessionDate);
     const dateB = b.lesson?.scheduledAt ? new Date(b.lesson.scheduledAt) : new Date(b.sessionDate);
     return dateA.getTime() - dateB.getTime();
  })

  const completedBookings = bookings.filter(b => {
    const lessonDate = b.lesson?.scheduledAt ? new Date(b.lesson.scheduledAt) : new Date(b.sessionDate);
    return (lessonDate <= now || b.status === 'completed') && b.status !== 'cancelled'
  }).sort((a, b) => {
     const dateA = a.lesson?.scheduledAt ? new Date(a.lesson.scheduledAt) : new Date(a.sessionDate);
     const dateB = b.lesson?.scheduledAt ? new Date(b.lesson.scheduledAt) : new Date(b.sessionDate);
     return dateB.getTime() - dateA.getTime();
  })

   const cancelledBookings = bookings.filter(b => b.status === 'cancelled').sort((a, b) => {
      const dateA = a.lesson?.scheduledAt ? new Date(a.lesson.scheduledAt) : new Date(a.sessionDate);
      const dateB = b.lesson?.scheduledAt ? new Date(b.lesson.scheduledAt) : new Date(b.sessionDate);
      return dateB.getTime() - dateA.getTime();
   })

  const stats = {
    total: bookings.length,
    upcoming: upcomingBookings.length,
    completed: completedBookings.length,
    cancelled: cancelledBookings.length,
  }

  const getTeacherName = (booking: Booking) => {
    if (booking.teacherId && typeof booking.teacherId === 'object') {
      return (booking.teacherId as any).name || t('checkout.tutor')
    }
    return t('checkout.tutor')
  }

  const getCourseName = (booking: Booking) => {
    if (booking.courseId && typeof booking.courseId === 'object') {
      const courseObj = booking.courseId as any
      const name = courseObj.name
      return typeof name === 'object' ? name.en : name || t('common.course')
    }
    return t('common.course')
  }

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    }
  }

  const calendarEvents = bookings.map(b => ({
    id: b._id,
    title: `${getCourseName(b)} with ${getTeacherName(b)}`,
    start: new Date(b.lesson?.scheduledAt || b.sessionDate),
    end: new Date(new Date(b.lesson?.scheduledAt || b.sessionDate).getTime() + (b.duration * 60 * 1000)),
    resource: b
  }))

  const nextLesson = upcomingBookings[0]

  return (
    <section className="dashboard__area section-pb-120">
      <div className="container ">
        <DashboardBannerTwo totalLessons={stats.total} completedLessons={stats.completed} />
        <div className="dashboard__inner-wrap">
          <div className="row">
            <DashboardSidebarTwo />
            <div className="col-lg-9">
              {/* Stats Overview */}
              <div className="dashboard__count-wrap mb-4">
                <div className="dashboard__content-title mb-3">
                  <h4 className="title">{t('dashboard.my_dashboard')}</h4>
                </div>
                <div className="row g-3">
                  <div className="col-lg-4 col-md-4 col-sm-6">
                    <div className="card shadow-sm border-0 h-100">
                      <div className="card-body text-center p-4">
                        <div className="text-primary mb-2">
                          <i className="flaticon-book" style={{ fontSize: '32px' }}></i>
                        </div>
                        <h3 className="fw-bold mb-1">{stats.total}</h3>
                        <p className="text-muted mb-0 small">{t('dashboard.total_lessons')}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4 col-md-4 col-sm-6">
                    <div className="card shadow-sm border-0 h-100">
                      <div className="card-body text-center p-4">
                        <div className="text-success mb-2">
                          <i className="flaticon-clock" style={{ fontSize: '32px' }}></i>
                        </div>
                        <h3 className="fw-bold mb-1">{stats.upcoming}</h3>
                        <p className="text-muted mb-0 small">{t('dashboard.upcoming')}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4 col-md-4 col-sm-6">
                    <div className="card shadow-sm border-0 h-100">
                      <div className="card-body text-center p-4">
                        <div className="text-info mb-2">
                          <i className="flaticon-trophy" style={{ fontSize: '32px' }}></i>
                        </div>
                        <h3 className="fw-bold mb-1">{stats.completed}</h3>
                        <p className="text-muted mb-0 small">{t('dashboard.completed')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Lesson Highlight */}
              {nextLesson && (
                <div className="card shadow-sm border-0 mb-4" style={{ borderLeft: '4px solid var(--tg-theme-primary)' }}>
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h6 className="text-muted text-uppercase small mb-1">{t('dashboard.next_lesson')}</h6>
                        <h5 className="fw-bold mb-0">{formatDateTime(nextLesson.lesson?.scheduledAt || nextLesson.sessionDate).date}</h5>
                      </div>
                      <span className="badge bg-success px-3 py-2">{formatDateTime(nextLesson.lesson?.scheduledAt || nextLesson.sessionDate).time}</span>
                    </div>
                    <div className="d-flex gap-3 align-items-center justify-content-between">
                      <div className="d-flex gap-3 align-items-center flex-grow-1">
                        <div className="flex-shrink-0">
                          {(nextLesson.teacherId as any)?.profilePicture ? (
                            <img
                              src={(nextLesson.teacherId as any).profilePicture}
                              alt={getTeacherName(nextLesson)}
                              className="rounded-circle"
                              style={{ width: 60, height: 60, objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center"
                              style={{ width: 60, height: 60 }}
                            >
                              <span className="fs-4 text-primary fw-bold">
                                {getTeacherName(nextLesson).charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="fw-bold mb-2">{getTeacherName(nextLesson)}</h6>
                          <div className="d-flex flex-wrap gap-3 align-items-center">
                            <span className="text-muted small d-inline-flex align-items-center">
                              <i className="flaticon-book me-1" style={{ fontSize: '14px' }}></i>
                              <span>{getCourseName(nextLesson)}</span>
                            </span>
                            <span className="text-muted small d-inline-flex align-items-center">
                              <i className="flaticon-clock me-1" style={{ fontSize: '14px' }}></i>
                              <span>{nextLesson.duration} {t('common.mins')}</span>
                            </span>
                            {nextLesson.studentCount && nextLesson.studentCount > 1 && (
                              <span className="text-muted small d-inline-flex align-items-center">
                                <i className="flaticon-user me-1" style={{ fontSize: '14px' }}></i>
                                <span>{nextLesson.studentCount}</span>
                              </span>
                            )}
                            {nextLesson.languageId && typeof nextLesson.languageId === 'object' && (
                              <span className="text-muted small d-inline-flex align-items-center">
                                <i className="flaticon-translate me-1" style={{ fontSize: '14px' }}></i>
                                <span>{((nextLesson.languageId as any).name?.en || (nextLesson.languageId as any).name)}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                         {nextLesson.meeting?.joinUrlStudent && (
                           <a
                             href={nextLesson.meeting.joinUrlStudent}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="btn btn-primary"
                             style={{ minWidth: '150px', whiteSpace: 'nowrap' }}
                           >
                             <i className="flaticon-video-camera me-2"></i>
                             {t('dashboard.join_lesson')}
                           </a>
                         )}
                         
                         <div className="position-relative booking-action-menu">
                             <button
                                className="btn p-0 border-0"
                                style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', color: '#6c757d' }}
                                onClick={(e) => {
                                   e.stopPropagation();
                                   const id = `${nextLesson._id}_next`;
                                   setOpenDropdownId(openDropdownId === id ? null : id)
                                }}
                                title={t('common.actions')}
                             >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" fill="currentColor" stroke="currentColor" strokeWidth="1"/>
                                  <path d="M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z" fill="currentColor" stroke="currentColor" strokeWidth="1"/>
                                  <path d="M12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z" fill="currentColor" stroke="currentColor" strokeWidth="1"/>
                                </svg>
                             </button>
                             {openDropdownId === `${nextLesson._id}_next` && (
                                 <div className="dropdown-menu show" style={{ position: 'absolute', right: 0, top: '100%', marginTop: '5px', zIndex: 1000, minWidth: '180px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', padding: '8px 0', border: 'none', borderRadius: '8px' }}>
                                    {nextLesson.meeting?.joinUrlStudent && (
                                      <button 
                                        className="dropdown-item d-flex align-items-center gap-2 px-3 py-2" 
                                        onClick={() => handleShareLink(nextLesson)}
                                      >
                                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted">
                                           <path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.65685 16.3431 8 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                           <path d="M6 15C7.65685 15 9 13.6569 9 12C9 10.3431 7.65685 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                           <path d="M18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C16.3431 16 15 17.3431 15 19C15 20.6569 16.3431 22 18 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                           <path d="M8.59 13.51L15.42 17.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                           <path d="M15.41 6.51L8.59 10.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                         </svg>
                                         <span>Share Link</span>
                                      </button>
                                    )}
                                    <button 
                                      className="dropdown-item d-flex align-items-center gap-2 px-3 py-2" 
                                      onClick={() => handleReschedule(nextLesson._id)}
                                    >
                                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted">
                                         <path d="M11 4H4C3.44772 4 3 4.44772 3 5V20C3 20.5523 3.44772 21 4 21H19C19.5523 21 20 20.5523 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                         <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                       </svg>
                                       <span>Reschedule</span>
                                    </button>
                                    <button 
                                      className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 text-danger" 
                                      onClick={() => handleBookingCancel(nextLesson._id, nextLesson.lesson?.scheduledAt || nextLesson.sessionDate)}
                                    >
                                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-danger flex-shrink-0">
                                         <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                         <path d="M8 6V4C8 3.46957 8.21071 3 8.58579 2.62513C8.96086 2.25026 9.46957 2.03967 10 2.03967H14C14.5304 2.03967 15.0391 2.25026 15.4142 2.62513C15.7893 3 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                       </svg>
                                       <span>Cancel Lesson</span>
                                    </button>
                                 </div>
                             )}
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* My Lessons Section */}
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                    <h5 className="fw-bold mb-0">{t('dashboard.my_lessons')}</h5>
                    <div className="d-flex align-items-center gap-4">
                      {/* View Toggles */}
                       <div 
                         className={`d-flex align-items-center gap-2 cursor-pointer ${view === 'list' ? 'text-primary' : 'text-muted'}`} 
                         onClick={() => setView('list')}
                         style={{ cursor: 'pointer', borderBottom: view === 'list' ? '2px solid var(--tg-theme-primary)' : 'none', paddingBottom: '4px' }}
                       >
                          <i className="flaticon-list"></i>
                          <span className="fw-medium">{t('dashboard.list')}</span>
                       </div>
                       <div 
                         className={`d-flex align-items-center gap-2 cursor-pointer ${view === 'calendar' ? 'text-primary' : 'text-muted'}`} 
                         onClick={() => setView('calendar')}
                         style={{ cursor: 'pointer', borderBottom: view === 'calendar' ? '2px solid var(--tg-theme-primary)' : 'none', paddingBottom: '4px' }}
                       >
                          <i className="flaticon-calendar"></i>
                          <span className="fw-medium">{t('dashboard.calendar')}</span>
                       </div>
                    </div>
                  </div>

                  {view === 'list' ? (
                    <>
                      {/* Tabs */}
                      <ul className="nav nav-tabs mb-4">
                        <li className="nav-item">
                          <button
                            className={`nav-link ${activeTab === 'upcoming' ? 'active' : ''}`}
                            onClick={() => setActiveTab('upcoming')}
                          >
                            {t('dashboard.upcoming')} ({stats.upcoming})
                          </button>
                        </li>
                        <li className="nav-item">
                           <button
                             className={`nav-link ${activeTab === 'completed' ? 'active' : ''}`}
                             onClick={() => setActiveTab('completed')}
                           >
                             {t('dashboard.completed')} ({stats.completed})
                           </button>
                         </li>
                         <li className="nav-item">
                           <button
                             className={`nav-link ${activeTab === 'cancelled' ? 'active' : ''}`}
                             onClick={() => setActiveTab('cancelled')}
                           >
                             Cancelled ({stats.cancelled})
                           </button>
                         </li>
                      </ul>

                      {/* Loading State */}
                      {loading && (
                        <div className="text-center py-5">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">{t('common.loading')}</span>
                          </div>
                        </div>
                      )}

                      {/* Error State */}
                      {error && (
                        <div className="alert alert-danger">
                          {error}
                        </div>
                      )}

                      {/* Lessons List */}
                      {!loading && !error && (
                        <div className="lessons-list">
                          {activeTab === 'upcoming' && upcomingBookings.length === 0 && (
                            <div className="text-center py-5">
                              <i className="flaticon-calendar" style={{ fontSize: '48px', color: '#ddd' }}></i>
                              <p className="text-muted mt-3">{t('dashboard.no_upcoming_lessons')}</p>
                              <button
                                className="btn btn-primary mt-2"
                                onClick={() => navigate('/courses')}
                              >
                                {t('dashboard.browse_courses')}
                              </button>
                            </div>
                          )}

                           {activeTab === 'completed' && completedBookings.length === 0 && (
                             <div className="text-center py-5">
                               <i className="flaticon-book" style={{ fontSize: '48px', color: '#ddd' }}></i>
                               <p className="text-muted mt-3">{t('dashboard.no_completed_lessons')}</p>
                             </div>
                           )}

                           {activeTab === 'cancelled' && cancelledBookings.length === 0 && (
                             <div className="text-center py-5">
                               <i className="flaticon-close" style={{ fontSize: '48px', color: '#ddd' }}></i>
                               <p className="text-muted mt-3">No cancelled lessons found</p>
                             </div>
                           )}

                          {activeTab === 'upcoming' && upcomingBookings.map((booking) => {
                            const { time } = formatDateTime(booking.lesson?.scheduledAt || booking.sessionDate)
                            return (
                              <div key={booking._id} className="card mb-3 border">
                                <div className="card-body p-3">
                                  <div className="row align-items-center">
                                    <div className="col-md-2 text-center mb-3 mb-md-0">
                                      <div className="text-primary small fw-semibold">
                                        {new Date(booking.lesson?.scheduledAt || booking.sessionDate).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                                      </div>
                                      <div className="fw-bold" style={{ fontSize: '28px' }}>
                                        {new Date(booking.lesson?.scheduledAt || booking.sessionDate).getDate()}
                                      </div>
                                      <div className="small text-muted">{time}</div>
                                    </div>
                                    <div className="col-md-6 mb-3 mb-md-0">
                                      <div className="d-flex gap-3 align-items-center">
                                        <div className="flex-shrink-0">
                                          {(booking.teacherId as any)?.profilePicture ? (
                                            <img
                                              src={(booking.teacherId as any).profilePicture}
                                              alt={getTeacherName(booking)}
                                              className="rounded-circle"
                                              style={{ width: 50, height: 50, objectFit: 'cover' }}
                                            />
                                          ) : (
                                            <div
                                              className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center"
                                              style={{ width: 50, height: 50 }}
                                            >
                                              <span className="text-primary fw-bold">
                                                {getTeacherName(booking).charAt(0)}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                        <div>
                                          <h6 className="fw-bold mb-2">{getTeacherName(booking)}</h6>
                                          <div className="d-flex flex-wrap gap-3 align-items-center">
                                            <span className="text-muted small d-inline-flex align-items-center">
                                              <i className="flaticon-book me-1" style={{ fontSize: '14px' }}></i>
                                              {getCourseName(booking)}
                                            </span>
                                            <span className="text-muted small d-inline-flex align-items-center">
                                              <i className="flaticon-clock me-1" style={{ fontSize: '14px' }}></i>
                                              {booking.duration} min
                                            </span>
                                            {booking.studentCount && booking.studentCount > 1 && (
                                              <span className="text-muted small d-inline-flex align-items-center">
                                                <i className="flaticon-user me-1" style={{ fontSize: '14px' }}></i>
                                                <span>{booking.studentCount}</span>
                                              </span>
                                            )}
                                            {booking.languageId && typeof booking.languageId === 'object' && (
                                              <span className="text-muted small d-inline-flex align-items-center">
                                                <i className="flaticon-translate me-1" style={{ fontSize: '14px' }}></i>
                                                <span>{((booking.languageId as any).name?.en || (booking.languageId as any).name)}</span>
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-md-4 text-md-end">
                                      <div className="d-flex gap-2 justify-content-end align-items-center">
                                          {booking.meeting?.joinUrlStudent && (
                                            <a
                                              href={booking.meeting.joinUrlStudent}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="btn btn-primary btn-sm w-100 w-md-auto"
                                            >
                                              <i className="flaticon-video-camera me-1"></i>
                                              Join
                                            </a>
                                          )}
                                          <div className="position-relative booking-action-menu">
                                             <button
                                                className="btn p-0 border-0"
                                                style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', color: '#6c757d' }}
                                                onClick={(e) => {
                                                   e.stopPropagation();
                                                   const id = `${booking._id}_list`;
                                                   setOpenDropdownId(openDropdownId === id ? null : id)
                                                }}
                                                title={t('common.actions')}
                                             >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                  <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" fill="currentColor" stroke="currentColor" strokeWidth="1"/>
                                                  <path d="M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z" fill="currentColor" stroke="currentColor" strokeWidth="1"/>
                                                  <path d="M12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z" fill="currentColor" stroke="currentColor" strokeWidth="1"/>
                                                </svg>
                                             </button>
                                             {openDropdownId === `${booking._id}_list` && (
                                                <div className="dropdown-menu show" style={{ position: 'absolute', right: 0, top: '100%', marginTop: '5px', zIndex: 1000, minWidth: '180px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', padding: '8px 0', border: 'none', borderRadius: '8px' }}>
                                                   {booking.meeting?.joinUrlStudent && (
                                                      <button 
                                                        className="dropdown-item d-flex align-items-center gap-2 px-3 py-2" 
                                                        onClick={() => handleShareLink(booking)}
                                                      >
                                                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted">
                                                           <path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.65685 16.3431 8 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                           <path d="M6 15C7.65685 15 9 13.6569 9 12C9 10.3431 7.65685 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                           <path d="M18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C16.3431 16 15 17.3431 15 19C15 20.6569 16.3431 22 18 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                           <path d="M8.59 13.51L15.42 17.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                           <path d="M15.41 6.51L8.59 10.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                         </svg>
                                                         <span>Share Link</span>
                                                      </button>
                                                    )}
                                                   <button 
                                                     className="dropdown-item d-flex align-items-center gap-2 px-3 py-2" 
                                                     onClick={() => handleReschedule(booking._id)}
                                                   >
                                                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted">
                                                         <path d="M11 4H4C3.44772 4 3 4.44772 3 5V20C3 20.5523 3.44772 21 4 21H19C19.5523 21 20 20.5523 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                         <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                       </svg>
                                                      <span>Reschedule</span>
                                                   </button>
                                                   <button 
                                                     className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 text-danger" 
                                                     onClick={() => handleBookingCancel(booking._id, booking.lesson?.scheduledAt || booking.sessionDate)}
                                                   >
                                                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-danger flex-shrink-0">
                                                         <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                         <path d="M8 6V4C8 3.46957 8.21071 3 8.58579 2.62513C8.96086 2.25026 9.46957 2.03967 10 2.03967H14C14.5304 2.03967 15.0391 2.25026 15.4142 2.62513C15.7893 3 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                       </svg>
                                                      <span>Cancel Lesson</span>
                                                   </button>
                                                </div>
                                             )}
                                          </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}

                          {activeTab === 'completed' && completedBookings.map((booking) => {
                            const { time } = formatDateTime(booking.lesson?.scheduledAt || booking.sessionDate)
                            return (
                              <div key={booking._id} className="card mb-3 border">
                                <div className="card-body p-3">
                                  <div className="row align-items-center">
                                    <div className="col-md-2 text-center mb-3 mb-md-0">
                                      <div className="text-muted small fw-semibold">
                                        {new Date(booking.lesson.scheduledAt).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                                      </div>
                                      <div className="fw-bold text-muted" style={{ fontSize: '28px' }}>
                                        {new Date(booking.lesson.scheduledAt).getDate()}
                                      </div>
                                      <div className="small text-muted">{time}</div>
                                    </div>
                                    <div className="col-md-7 mb-3 mb-md-0">
                                      <div className="d-flex gap-3 align-items-center">
                                        <div className="flex-shrink-0">
                                          {(booking.teacherId as any)?.profilePicture ? (
                                            <img
                                              src={(booking.teacherId as any).profilePicture}
                                              alt={getTeacherName(booking)}
                                              className="rounded-circle"
                                              style={{ width: 50, height: 50, objectFit: 'cover' }}
                                            />
                                          ) : (
                                            <div
                                              className="rounded-circle bg-secondary bg-opacity-10 d-flex align-items-center justify-content-center"
                                              style={{ width: 50, height: 50 }}
                                            >
                                              <span className="text-secondary fw-bold">
                                                {getTeacherName(booking).charAt(0)}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                        <div>
                                          <h6 className="fw-bold mb-2">{getTeacherName(booking)}</h6>
                                          <div className="d-flex flex-wrap gap-3 align-items-center">
                                            <span className="text-muted small d-inline-flex align-items-center">
                                              <i className="flaticon-book me-1" style={{ fontSize: '14px' }}></i>
                                              {getCourseName(booking)}
                                            </span>
                                            <span className="text-muted small d-inline-flex align-items-center">
                                              <i className="flaticon-clock me-1" style={{ fontSize: '14px' }}></i>
                                              {booking.duration} min
                                            </span>
                                            {booking.studentCount && booking.studentCount > 1 && (
                                              <span className="text-muted small d-inline-flex align-items-center">
                                                <i className="flaticon-user me-1" style={ {fontSize: '14px' }}></i>
                                                <span>{booking.studentCount}</span>
                                              </span>
                                            )}
                                            {booking.languageId && typeof booking.languageId === 'object' && (
                                              <span className="text-muted small d-inline-flex align-items-center">
                                                <i className="flaticon-translate me-1" style={{ fontSize: '14px' }}></i>
                                                <span>{((booking.languageId as any).name?.en || (booking.languageId as any).name)}</span>
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-md-3 text-md-end">
                                      <span className="badge bg-secondary">Completed</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}

                          {activeTab === 'cancelled' && cancelledBookings.map((booking) => {
                             const { time } = formatDateTime(booking.lesson?.scheduledAt || booking.sessionDate)
                             return (
                               <div key={booking._id} className="card mb-3 border">
                                 <div className="card-body p-3">
                                   <div className="row align-items-center">
                                     <div className="col-md-2 text-center mb-3 mb-md-0">
                                       <div className="text-danger small fw-semibold">
                                         {new Date(booking.lesson?.scheduledAt || booking.sessionDate).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                                       </div>
                                       <div className="fw-bold text-danger" style={{ fontSize: '28px' }}>
                                         {new Date(booking.lesson?.scheduledAt || booking.sessionDate).getDate()}
                                       </div>
                                       <div className="small text-muted">{time}</div>
                                     </div>
                                     <div className="col-md-7 mb-3 mb-md-0">
                                       <div className="d-flex gap-3 align-items-center">
                                         <div className="flex-shrink-0">
                                           {(booking.teacherId as any)?.profilePicture ? (
                                             <img
                                               src={(booking.teacherId as any).profilePicture}
                                               alt={getTeacherName(booking)}
                                               className="rounded-circle"
                                               style={{ width: 50, height: 50, objectFit: 'cover' }}
                                             />
                                           ) : (
                                             <div
                                               className="rounded-circle bg-danger bg-opacity-10 d-flex align-items-center justify-content-center"
                                               style={{ width: 50, height: 50 }}
                                             >
                                               <span className="text-danger fw-bold">
                                                 {getTeacherName(booking).charAt(0)}
                                               </span>
                                             </div>
                                           )}
                                         </div>
                                         <div>
                                           <h6 className="fw-bold mb-2">{getTeacherName(booking)}</h6>
                                           <div className="d-flex flex-wrap gap-3 align-items-center">
                                             <span className="text-muted small d-inline-flex align-items-center">
                                               <i className="flaticon-book me-1" style={{ fontSize: '14px' }}></i>
                                               {getCourseName(booking)}
                                             </span>
                                             <span className="text-muted small d-inline-flex align-items-center">
                                               <i className="flaticon-clock me-1" style={{ fontSize: '14px' }}></i>
                                               {booking.duration} min
                                             </span>
                                           </div>
                                         </div>
                                       </div>
                                     </div>
                                     <div className="col-md-3 text-md-end">
                                       <span className="badge bg-danger">Cancelled</span>
                                     </div>
                                   </div>
                                 </div>
                               </div>
                             )
                           })}
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ height: 600 }}>
                       <Calendar
                          localizer={localizer}
                          events={calendarEvents}
                          startAccessor="start"
                          endAccessor="end"
                          style={{ height: '100%' }}
                          defaultView="month"
                          views={['month', 'week', 'day', 'agenda']}
                          eventPropGetter={(event) => ({
                              style: {
                                 backgroundColor: event.resource.status === 'completed' ? '#6c757d' : 'var(--tg-theme-primary)',
                              }
                          })}
                       />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {rescheduleBookingId && (
        <div className="reschedule-modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1050,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="reschedule-modal bg-white rounded-3 shadow-lg w-100" style={{ maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header p-4 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="modal-title fw-bold mb-0">Reschedule Lesson</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={closeRescheduleModal}
                aria-label="Close"
              ></button>
            </div>
            
            <div className="modal-body p-4 overflow-auto custom-scrollbar">
              {loadingSlots ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading slots...</span>
                  </div>
                  <p className="mt-2 text-muted">Finding available time slots...</p>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-5">
                  <i className="flaticon-calendar text-muted" style={{ fontSize: '48px' }}></i>
                  <p className="mt-3 mb-0">No available slots found for this teacher and course.</p>
                </div>
              ) : (
                <div className="available-slots-list">
                  <p className="text-muted mb-3">Please select a new time for your lesson:</p>
                  <div className="row g-2">
                    {availableSlots.map((slot) => {
                      const slotDate = new Date(slot.date);
                      const isSelected = selectedSlotId === slot._id;
                      return (
                        <div key={slot._id} className="col-sm-6">
                            <button
                              className={`btn w-100 text-start p-3 border ${isSelected ? 'border-primary bg-primary bg-opacity-10' : 'border-light-subtle'}`}
                              onClick={() => setSelectedSlotId(slot._id)}
                              style={{ transition: 'all 0.2s' }}
                            >
                              <div className="d-flex align-items-center gap-2">
                                <div className={`flex-shrink-0 ${isSelected ? 'text-primary' : 'text-muted'}`}>
                                  <i className="flaticon-calendar"></i>
                                </div>
                                <div>
                                  <div className={`fw-semibold ${isSelected ? 'text-primary' : 'text-dark'}`}>
                                    {slotDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                  </div>
                                  <div className="small text-muted">
                                    {slot.startTime} - {slot.endTime}
                                  </div>
                                </div>
                              </div>
                            </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-footer p-4 border-top d-flex justify-content-end gap-2">
              <button 
                type="button" 
                className="btn btn-light" 
                onClick={closeRescheduleModal}
                disabled={isRescheduling}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleConfirmReschedule}
                disabled={!selectedSlotId || isRescheduling}
              >
                {isRescheduling ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Rescheduling...
                  </>
                ) : (
                  'Confirm Reschedule'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
export default StudentDashboardArea
