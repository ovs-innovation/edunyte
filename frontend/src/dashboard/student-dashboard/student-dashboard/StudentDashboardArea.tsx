import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../../contexts/AuthContext'
import { getMyBookings, Booking } from '../../../services/bookingService'
import DashboardBannerTwo from '../../dashboard-common/DashboardBannerTwo'
import DashboardSidebarTwo from '../../dashboard-common/DashboardSidebarTwo'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = momentLocalizer(moment)

const StudentDashboardArea = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { token } = useAuth() as any
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming')
  const [view, setView] = useState<'list' | 'calendar'>('list')

  useEffect(() => {
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
    fetchBookings()
  }, [token, t])

  const now = new Date()
  const upcomingBookings = bookings.filter(b => {
    const lessonDate = new Date(b.lesson.scheduledAt)
    return lessonDate > now && b.paymentStatus === 'paid' && b.status !== 'cancelled'
  }).sort((a, b) => new Date(a.lesson.scheduledAt).getTime() - new Date(b.lesson.scheduledAt).getTime())

  const completedBookings = bookings.filter(b => {
    const lessonDate = new Date(b.lesson.scheduledAt)
    return lessonDate <= now || b.status === 'completed'
  }).sort((a, b) => new Date(b.lesson.scheduledAt).getTime() - new Date(a.lesson.scheduledAt).getTime())

  const stats = {
    total: bookings.length,
    upcoming: upcomingBookings.length,
    completed: completedBookings.length,
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
    start: new Date(b.lesson.scheduledAt),
    end: new Date(new Date(b.lesson.scheduledAt).getTime() + (b.duration * 60 * 1000)),
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
                        <h5 className="fw-bold mb-0">{formatDateTime(nextLesson.lesson.scheduledAt).date}</h5>
                      </div>
                      <span className="badge bg-success px-3 py-2">{formatDateTime(nextLesson.lesson.scheduledAt).time}</span>
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
                            {nextLesson.languageId && typeof nextLesson.languageId === 'object' && (
                              <span className="text-muted small d-inline-flex align-items-center">
                                <i className="flaticon-translate me-1" style={{ fontSize: '14px' }}></i>
                                <span>{((nextLesson.languageId as any).name?.en || (nextLesson.languageId as any).name)}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
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

                          {activeTab === 'upcoming' && upcomingBookings.map((booking) => {
                            const { time } = formatDateTime(booking.lesson.scheduledAt)
                            return (
                              <div key={booking._id} className="card mb-3 border">
                                <div className="card-body p-3">
                                  <div className="row align-items-center">
                                    <div className="col-md-2 text-center mb-3 mb-md-0">
                                      <div className="text-primary small fw-semibold">
                                        {new Date(booking.lesson.scheduledAt).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                                      </div>
                                      <div className="fw-bold" style={{ fontSize: '28px' }}>
                                        {new Date(booking.lesson.scheduledAt).getDate()}
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
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}

                          {activeTab === 'completed' && completedBookings.map((booking) => {
                            const { time } = formatDateTime(booking.lesson.scheduledAt)
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
    </section>
  )
}
export default StudentDashboardArea
