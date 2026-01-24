const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export interface Course {
  _id: string
  name: string
  description?: string
  category?: string
  image?: string
  status: string
  createdBy?: {
    _id: string
    name: string
    email: string
  }
  createdAt?: string
  updatedAt?: string
}

export interface CoursesResponse {
  courses: Course[]
  count: number
}

export const fetchCourses = async (params?: {
  status?: string
  search?: string
  category?: string
  limit?: number
}): Promise<CoursesResponse> => {
  const queryParams = new URLSearchParams()
  if (params?.status) {
    queryParams.append('status', params.status)
  }
  if (params?.search) {
    queryParams.append('search', params.search)
  }
  if (params?.category) {
    queryParams.append('category', params.category)
  }
  if (params?.limit) {
    queryParams.append('limit', params.limit.toString())
  }

  const response = await fetch(`${API_BASE_URL}/public/courses?${queryParams.toString()}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch courses')
  }

  return await response.json()
}

export const fetchCourse = async (slug: string): Promise<{ course: Course }> => {
  const response = await fetch(`${API_BASE_URL}/public/courses/${slug}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch course')
  }

  return await response.json()
}

export interface TeacherProfile {
  photo?: string
  rating: number
  totalReviews: number
  totalStudents: number
  experience: number
  country: string
  countryCode: string
  bio: string
}

export interface AvailabilitySlot {
  _id: string
  date: string
  startTime: string
  endTime: string
  duration: number
  price: number
  currency: string
  timezone: string
}

export interface TeacherCourse {
  _id: string
  teacherId: {
    _id: string
    name: string
    email: string
  }
  courseId: {
    _id: string
    name: string
    description?: string
  }
  languageIds: Array<{
    _id: string
    name: string
    code: string
    nativeName?: string
  }>
  price: number
  currency: string
  timezone: string
  experience: string
  bio: string
  aboutCourse?: string
  introductionVideo?: string
  teacherProfile: TeacherProfile
  availability: AvailabilitySlot[]
  status: string
  createdAt?: string
  updatedAt?: string
}

export interface TeachersResponse {
  teachers: TeacherCourse[]
  count: number
}

export const fetchCourseTeachers = async (
  slug: string,
  params?: {
    startDate?: string
    endDate?: string
    currency?: string
  }
): Promise<TeachersResponse> => {
  const queryParams = new URLSearchParams()
  if (params?.startDate) {
    queryParams.append('startDate', params.startDate)
  }
  if (params?.endDate) {
    queryParams.append('endDate', params.endDate)
  }
  if (params?.currency) {
    queryParams.append('currency', params.currency)
  }

  const response = await fetch(`${API_BASE_URL}/public/courses/${slug}/teachers?${queryParams.toString()}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch teachers')
  }

  return await response.json()
}

export interface AvailabilityResponse {
  availabilities: Array<{
    _id: string
    date: string
    startTime: string
    endTime: string
    duration: number
    price: number
    currency: string
    timezone: string
    displayTimezone?: string
    priceBreakdown?: {
      teacherPrice: number
      platformMargin: number
      platformMarginPercent: number
      meetingPlatformCost: number
    }
  }>
  count: number
}

export const fetchCourseAvailability = async (
  courseId: string,
  params?: {
    teacherId?: string
    startDate?: string
    endDate?: string
    studentTimezone?: string
  }
): Promise<AvailabilityResponse> => {
  const queryParams = new URLSearchParams()
  queryParams.append('courseId', courseId)
  if (params?.teacherId) {
    queryParams.append('teacherId', params.teacherId)
  }
  if (params?.startDate) {
    queryParams.append('startDate', params.startDate)
  }
  if (params?.endDate) {
    queryParams.append('endDate', params.endDate)
  }
  if (params?.studentTimezone) {
    queryParams.append('studentTimezone', params.studentTimezone)
  }

  const response = await fetch(`${API_BASE_URL}/public/courses/availability?${queryParams.toString()}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch availability')
  }

  return await response.json()
}

