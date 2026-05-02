const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export interface Category {
  _id: string
  name: string
  description?: string
  image?: string
  slug?: string
  status: string
  createdBy?: {
    _id: string
    name: string
    email: string
  }
  createdAt?: string
  updatedAt?: string
}

export interface CategoriesResponse {
  categories: Category[]
  count: number
}

export const fetchCategories = async (status?: string): Promise<CategoriesResponse> => {
  const params = new URLSearchParams()
  if (status) {
    params.append('status', status)
  }

  const response = await fetch(`${API_BASE_URL}/public/categories?${params.toString()}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch categories')
  }

  return await response.json()
}

export const fetchCategory = async (id: string): Promise<{ category: Category }> => {
  const response = await fetch(`${API_BASE_URL}/public/categories/${id}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch category')
  }

  return await response.json()
}

