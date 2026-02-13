const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085/api'

export interface Booking {
  _id: string
  studentId: string
  teacherId: string
  teacherCourseId: string
  courseId: string
  languageId: string
  sessionDate: string
  startTime: string
  endTime: string
  duration: number
  timezone: string
  studentCount?: number // Number of students attending
  lesson: {
    duration: number
    scheduledAt: string
    timezone: string
  }
  meeting?: {
    provider: string
    meetingId: string
    joinUrlStudent: string
    joinUrlTeacher: string
  }
  paymentStatus: string
  status?: string
  createdAt: string
  updatedAt: string
  // Populated fields
  teacher?: {
    _id: string
    firstName: string
    lastName: string
    profilePicture?: string
    teacherProfile?: {
      rating?: number
      totalReviews?: number
    }
  }
  course?: {
    _id: string
    name: string | { en: string }
    description?: string | { en: string }
  }
  language?: {
    _id: string
    name: string
  }
}

export const getMyBookings = async (token: string): Promise<Booking[]> => {
  const response = await fetch(`${API_BASE_URL}/bookings/my-bookings`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch bookings')
  }

  const data = await response.json()
  return data.bookings || []
}

export const getBookingById = async (id: string, token: string): Promise<Booking> => {
  const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch booking')
  }

  const data = await response.json()
  return data.booking
}

export const cancelBooking = async (id: string, token: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/bookings/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: 'cancelled' }),
  })

  if (!response.ok) {
    throw new Error('Failed to cancel booking')
  }
}

export const getAvailableSlots = async (teacherCourseId: string, token: string): Promise<any[]> => {
  const response = await fetch(`${API_BASE_URL}/bookings/available-slots/${teacherCourseId}`, {
    headers: {
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
     throw new Error('Failed to fetch slots');
  }
  
  const data = await response.json();
  return data.availabilities || [];
}

export const rescheduleBooking = async (bookingId: string, availabilityId: string, token: string): Promise<Booking> => {
   const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/reschedule`, {
      method: 'POST',
      headers: {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json',
      },
      body: JSON.stringify({ availabilityId }),
   });
   
   if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Failed to reschedule booking');
   }
   
   const data = await response.json();
   return data.booking;
}
