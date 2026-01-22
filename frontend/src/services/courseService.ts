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

export const fetchCourse = async (id: string): Promise<{ course: Course }> => {
  const response = await fetch(`${API_BASE_URL}/public/courses/${id}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch course')
  }

  return await response.json()
}

