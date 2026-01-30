import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { TeacherCourse } from '../../../services/courseService';
import { useCurrency } from '../../../hooks/useCurrency';

interface AvailabilitySlot {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  pricing?: { baseAmountUSD: number; baseCurrency: 'USD' };
  // Derived convenience fields (USD base) – display only
  price?: number;
  currency?: string;
  timezone: string;
  displayTimezone?: string;
}

interface BookingModalProps {
  teacher: TeacherCourse;
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bookingData: any) => void;
}

const BookingModal = ({ teacher, courseId, isOpen, onClose, onConfirm }: BookingModalProps) => {
  const { t } = useTranslation();
  const { currency: selectedCurrency, convertAndFormatPrice } = useCurrency();
  const [selectedDuration, setSelectedDuration] = useState<number>(50);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [availabilities, setAvailabilities] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [studentTimezone, setStudentTimezone] = useState<string>('UTC');
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());

  useEffect(() => {
    if (isOpen) {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setStudentTimezone(tz);
      loadAvailability(tz);
    }
  }, [isOpen, teacher, courseId, selectedDate, selectedDuration]);

  const loadAvailability = async (tzOverride?: string) => {
    if (!teacher || !courseId) return;
    try {
      setLoading(true);
      const teacherId = typeof teacher.teacherId === 'object' ? teacher.teacherId._id : '';
      const startDate = new Date(selectedDate);
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date(selectedDate);
      endDate.setDate(endDate.getDate() + 30);
      const tz = tzOverride || studentTimezone;

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085/api';
      const response = await fetch(
        `${API_BASE_URL}/public/courses/availability?courseId=${courseId}&teacherId=${teacherId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&studentTimezone=${encodeURIComponent(tz)}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch availability');
      }
      
      const data = await response.json();
      const normalized: AvailabilitySlot[] = (data.availabilities || []).map((av: any) => ({
        ...av,
        price:
          typeof av?.price === 'number'
            ? av.price
            : typeof av?.pricing?.baseAmountUSD === 'number'
              ? av.pricing.baseAmountUSD
              : undefined,
        currency: typeof av?.currency === 'string' ? av.currency : 'USD',
      }));
      const filtered = normalized.filter((av: AvailabilitySlot) => av.duration === selectedDuration);
      setAvailabilities(filtered);
    } catch (err) {
      console.error('Failed to load availability:', err);
    } finally {
      setLoading(false);
    }
  };

  void convertAndFormatPrice; // loaded for currency rates; price formatting is handled elsewhere in this modal

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  const getWeekDates = () => {
    const dates: Date[] = [];
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getSlotsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return availabilities.filter((av) => {
      const avDate = new Date(av.date).toISOString().split('T')[0];
      return avDate === dateStr;
    });
  };

  const groupSlotsByTime = (slots: AvailabilitySlot[]) => {
    const groups: { [key: string]: AvailabilitySlot[] } = {};
    slots.forEach((slot) => {
      const hour = parseInt(slot.startTime.split(':')[0], 10);
      let group = 'Evening';
      if (hour < 12) group = 'Morning';
      else if (hour < 17) group = 'Afternoon';
      if (!groups[group]) groups[group] = [];
      groups[group].push(slot);
    });
    return groups;
  };

  const handleConfirm = () => {
    if (!selectedSlot) return;
    
    // Extract teacher information
    const teacherObj = typeof teacher.teacherId === 'object' ? teacher.teacherId : null;
    const teacherId = teacherObj?._id || '';
    const teacherName = teacherObj?.name || '';
    
    // Get course information from teacher object if available
    const courseObj = typeof teacher.courseId === 'object' ? teacher.courseId : null;
    // Safely handle both string and object types for name/description
    const courseName = typeof courseObj?.name === 'object' 
      ? (courseObj.name as any)?.en || '' 
      : courseObj?.name || '';
    const courseDescription = typeof courseObj?.description === 'object'
      ? (courseObj.description as any)?.en || ''
      : courseObj?.description || '';
    
    onConfirm({
      availabilityId: selectedSlot._id,
      teacherCourseId: teacher._id,
      teacherId,
      courseId,
      duration: selectedDuration,
      date: selectedSlot.date,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      selectedCurrency,
      timezone: studentTimezone,
      // Additional info for checkout page display
      teacherName,
      teacherPhoto: teacher.teacherProfile?.photo || '',
      teacherRating: teacher.teacherProfile?.rating || 0,
      teacherReviews: teacher.teacherProfile?.totalReviews || 0,
      teacherStudents: teacher.teacherProfile?.totalStudents || 0,
      teacherLessons: (teacher.teacherProfile as any)?.totalLessons || 0,
      teacherYearsTeaching: (teacher.teacherProfile as any)?.yearsTeaching || 0,
      courseName,
      courseDescription,
    });
  };

  const teacherName = typeof teacher.teacherId === 'object' ? teacher.teacherId.name : '';
  const teacherPhoto = teacher.teacherProfile?.photo || '';

  if (!isOpen) return null;

  const weekDates = getWeekDates();
  const selectedDateSlots = getSlotsForDate(selectedDate);
  const groupedSlots = groupSlotsByTime(selectedDateSlots);

  return (
    <div
      className="modal fade show"
      style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content" style={{ borderRadius: '16px', border: 'none' }}>
          <div className="modal-header border-0 pb-0" style={{ padding: '24px 24px 16px' }}>
            <div className="d-flex align-items-center gap-3">
              {teacherPhoto ? (
                <img
                  src={teacherPhoto}
                  alt={teacherName}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #f0f0f0',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '20px',
                    fontWeight: 'bold',
                  }}
                >
                  {teacherName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h5 className="modal-title mb-1 fw-bold" style={{ fontSize: '20px' }}>{t('common.book_trial_lesson')}</h5>
                <p className="text-muted small mb-0">{t('common.to_discuss_level')}</p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
              style={{ fontSize: '18px' }}
            ></button>
          </div>
          <div className="modal-body" style={{ padding: '24px' }}>
            <div className="mb-4">
              <label className="form-label fw-semibold mb-2">{t('common.lesson_duration')}</label>
              <div className="d-flex gap-2">
                <button
                  className={`btn ${selectedDuration === 25 ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => {
                    setSelectedDuration(25);
                    setSelectedSlot(null);
                  }}
                  style={{
                    borderRadius: '8px',
                    padding: '10px 20px',
                    backgroundColor: selectedDuration === 25 ? '#e91e63' : 'transparent',
                    borderColor: selectedDuration === 25 ? '#e91e63' : '#ddd',
                    color: selectedDuration === 25 ? '#fff' : '#000',
                  }}
                >
                  25 {t('common.mins')}
                </button>
                <button
                  className={`btn ${selectedDuration === 50 ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => {
                    setSelectedDuration(50);
                    setSelectedSlot(null);
                  }}
                  style={{
                    borderRadius: '8px',
                    padding: '10px 20px',
                    backgroundColor: selectedDuration === 50 ? '#e91e63' : 'transparent',
                    borderColor: selectedDuration === 50 ? '#e91e63' : '#ddd',
                    color: selectedDuration === 50 ? '#fff' : '#000',
                  }}
                >
                  50 {t('common.mins')}
                </button>
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <label className="form-label fw-semibold mb-0">{t('common.select_date')}</label>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => {
                      const newWeek = new Date(currentWeek);
                      newWeek.setDate(newWeek.getDate() - 7);
                      setCurrentWeek(newWeek);
                    }}
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => {
                      const newWeek = new Date(currentWeek);
                      newWeek.setDate(newWeek.getDate() + 7);
                      setCurrentWeek(newWeek);
                    }}
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>
              <div className="d-flex gap-2 flex-wrap">
                {weekDates.map((date, idx) => {
                  const isSelected = date.toDateString() === selectedDate.toDateString();
                  const slotsCount = getSlotsForDate(date).length;
                  return (
                    <button
                      key={idx}
                      className={`btn ${isSelected ? 'btn-primary' : 'btn-outline-secondary'}`}
                      onClick={() => {
                        setSelectedDate(date);
                        setSelectedSlot(null);
                      }}
                      style={{
                        flex: '1',
                        minWidth: '80px',
                        borderRadius: '8px',
                        padding: '8px',
                        backgroundColor: isSelected ? '#e91e63' : 'transparent',
                        borderColor: isSelected ? '#e91e63' : '#ddd',
                        color: isSelected ? '#fff' : '#000',
                      }}
                    >
                      <div className="small">{formatDate(date).split(' ')[0]}</div>
                      <div className="fw-bold">{date.getDate()}</div>
                      {slotsCount > 0 && (
                        <div className="small" style={{ fontSize: '10px' }}>
                          {slotsCount} {t('common.slots')}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-3">
              <p className="text-muted small mb-2">
                {t('common.in_your_timezone')} {studentTimezone} ({new Date().toLocaleTimeString('en-US', { timeZone: studentTimezone, timeZoneName: 'short' }).split(' ').pop() || ''})
              </p>
              <p className="text-muted small mb-0">
                {formatFullDate(selectedDate)}
              </p>
            </div>

            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">{t('common.loading')}</span>
                </div>
              </div>
            ) : selectedDateSlots.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted">{t('common.no_slots_available')}</p>
              </div>
            ) : (
              <div className="mb-4">
                {Object.entries(groupedSlots).map(([group, slots]) => (
                  <div key={group} className="mb-3">
                    <h6 className="fw-semibold mb-2">{group}</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {slots.map((slot) => {
                        const isSelected = selectedSlot?._id === slot._id;
                        return (
                          <button
                            key={slot._id}
                            className={`btn ${isSelected ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setSelectedSlot(slot)}
                            style={{
                              borderRadius: '8px',
                              padding: '8px 16px',
                              backgroundColor: isSelected ? '#e91e63' : 'transparent',
                              borderColor: '#e91e63',
                              color: isSelected ? '#fff' : '#e91e63',
                            }}
                          >
                            {formatTime(slot.startTime)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="modal-footer border-0" style={{ padding: '16px 24px 24px' }}>
            <button
              type="button"
              className="btn"
              onClick={onClose}
              style={{
                borderRadius: '8px',
                padding: '12px 24px',
                border: '1px solid #ddd',
                backgroundColor: '#fff',
                color: '#000',
                marginRight: '12px',
              }}
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              className="btn"
              onClick={handleConfirm}
              disabled={!selectedSlot}
              style={{
                borderRadius: '8px',
                backgroundColor: selectedSlot ? '#e91e63' : '#ccc',
                borderColor: selectedSlot ? '#e91e63' : '#ccc',
                padding: '12px 32px',
                fontWeight: '600',
                color: '#fff',
                cursor: selectedSlot ? 'pointer' : 'not-allowed',
              }}
            >
              {t('common.continue')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;

