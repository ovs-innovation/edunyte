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
