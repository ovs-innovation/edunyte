import { Permission, Role } from "./rbac";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8096/api";
export const TOKEN_KEY = "admin-auth-token";
export const ROLE_KEY = "admin-role";

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  permissions: Permission[];
  status: string;
  lastLogin?: string;
  createdAt?: string;
}

export interface ApiRole {
  id: string;
  name: string;
  key: string;
  permissions: Permission[];
  createdAt?: string;
}

const getToken = () => localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);

const getHeaders = () => {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const apiFetch = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (response.status === 401) {
    clearToken();
  }
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data as T;
};

export const AuthAPI = {
  login: (payload: { email: string; password: string; otp?: string }) =>
    apiFetch<{ token?: string; user?: ApiUser; requiresOTP?: boolean; message?: string }>("/auth/login?appType=admin", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  register: (payload: { name: string; email: string; password: string; role?: string }) =>
    apiFetch<{ token: string; user: ApiUser }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  forgot: (payload: { email: string }) =>
    apiFetch<{ message: string }>("/auth/forgot", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  reset: (payload: { email: string; otp: string; password: string }) =>
    apiFetch<{ success?: boolean; message: string }>("/auth/reset", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  me: () => apiFetch<{ user: ApiUser }>("/auth/me"),
};

export const UsersAPI = {
  list: () => apiFetch<{ users: ApiUser[] }>("/users"),
  create: (payload: { name: string; email: string; password: string; role?: string; status?: string }) =>
    apiFetch<{ user: ApiUser }>("/users", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  update: (id: string, payload: { name?: string; email?: string; password?: string; role?: string; status?: string }) =>
    apiFetch<{ user: ApiUser }>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  remove: (id: string) =>
    apiFetch<{ success: boolean }>(`/users/${id}`, {
      method: "DELETE",
    }),
};

export const RolesAPI = {
  list: () => apiFetch<{ roles: ApiRole[]; permissions: Permission[] }>("/roles"),
  create: (payload: { name: string; key?: string; permissions: Permission[] }) =>
    apiFetch<{ role: ApiRole }>("/roles", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  update: (id: string, payload: { name?: string; permissions?: Permission[] }) =>
    apiFetch<{ role: ApiRole }>(`/roles/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};

export interface ApiSettings {
  siteName: string;
  siteUrl: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyReports: boolean;
  twoFactorAuth: boolean;
  sessionTimeout: boolean;
  ipWhitelist: boolean;
  themeColor: string;
  compactMode: boolean;
  platformFeePercent?: number;
}

export const SettingsAPI = {
  get: () => apiFetch<{ settings: ApiSettings }>("/settings"),
  update: (payload: Partial<ApiSettings>) =>
    apiFetch<{ settings: ApiSettings }>("/settings", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};

export interface ApiTeacherProfile {
  _id: string;
  userId: ApiUser | string;
  bio: string;
  aboutUs?: string;
  photo?: string;
  expertise: string[];
  experience: number;
  country?: string;
  countryCode?: string;
  kycStatus: "pending" | "verified" | "rejected";
  rejectionReason?: string;
  socialLinks?: {
    website?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
    facebook?: string;
  };
  payoutInfo: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    upiId?: string;
  };
  totalEarnings: number;
  pendingPayout?: number;
  paidAmount?: number;
  rating: number;
  totalReviews: number;
  totalCourses?: number;
  publishedCourses?: number;
  totalStudents?: number;
  createdAt?: string;
  updatedAt?: string;
}



export const TeacherProfileAPI = {
  getMyProfile: () => apiFetch<{ profile: ApiTeacherProfile }>("/teacher-profiles/me"),
  getProfile: (userId: string) => apiFetch<{ profile: ApiTeacherProfile }>(`/teacher-profiles/${userId}`),
  list: () => apiFetch<{ profiles: ApiTeacherProfile[]; count: number }>("/teacher-profiles"),
  update: (userId: string, payload: {
    bio?: string | { en: string };
    aboutUs?: string | { en: string };
    expertise?: string[];
    experience?: number;
    kycStatus?: "pending" | "verified" | "rejected";
    rejectionReason?: string;
    payoutInfo?: Partial<ApiTeacherProfile["payoutInfo"]>;
    rating?: number;
  }) =>
    apiFetch<{ profile: ApiTeacherProfile }>(`/teacher-profiles/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  updateMyProfile: (payload: {
    bio?: string | { en: string };
    aboutUs?: string | { en: string };
    photo?: string;
    expertise?: string[];
    experience?: number;
    country?: string;
    countryCode?: string;
    socialLinks?: Partial<ApiTeacherProfile["socialLinks"]>;
    payoutInfo?: Partial<ApiTeacherProfile["payoutInfo"]>;
  }) =>
    apiFetch<{ profile: ApiTeacherProfile }>("/teacher-profiles/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  updateKyc: (userId: string, kycStatus: "pending" | "verified" | "rejected", rejectionReason?: string) =>
    apiFetch<{ profile: ApiTeacherProfile }>(`/teacher-profiles/${userId}/kyc`, {
      method: "PATCH",
      body: JSON.stringify({ kycStatus, rejectionReason }),
    }),
  updateEarnings: (userId: string, amount: number, operation: "add" | "set" = "add") =>
    apiFetch<{ profile: ApiTeacherProfile }>(`/teacher-profiles/${userId}/earnings`, {
      method: "PATCH",
      body: JSON.stringify({ amount, operation }),
    }),
};

export interface ApiStudentProfile {
  _id: string;
  userId: ApiUser | string;
  photo?: string;
  phone?: string;
  country?: string;
  state?: string;
  city?: string;
  timezone?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
    github?: string;
  };
  progress: {
    totalCourses: number;
    totalHoursSpent: number;
    totalLessonsBooked: number;
    totalLessonsCompleted: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export const StudentProfileAPI = {
  getMyProfile: () => apiFetch<{ profile: ApiStudentProfile }>("/student-profiles/me"),
  getProfile: (userId: string) => apiFetch<{ profile: ApiStudentProfile }>(`/student-profiles/${userId}`),
  list: () => apiFetch<{ profiles: ApiStudentProfile[]; count: number }>("/student-profiles"),
  update: (userId: string, payload: {
    photo?: string;
    phone?: string;
    country?: string;
    state?: string;
    city?: string;
    timezone?: string;
    socialLinks?: Partial<ApiStudentProfile["socialLinks"]>;
  }) =>
    apiFetch<{ profile: ApiStudentProfile }>(`/student-profiles/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  updateMyProfile: (payload: {
    photo?: string;
    phone?: string;
    country?: string;
    state?: string;
    city?: string;
    timezone?: string;
    socialLinks?: Partial<ApiStudentProfile["socialLinks"]>;
  }) =>
    apiFetch<{ profile: ApiStudentProfile }>("/student-profiles/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  recalculateProgress: (userId: string) =>
    apiFetch<{ profile: ApiStudentProfile; progress: any }>((`/student-profiles/${userId}/recalculate-progress`), {
      method: "POST"
    }),
};

export const setToken = (token: string, remember = true) => {
  if (remember) {
    localStorage.setItem(TOKEN_KEY, token);
    sessionStorage.removeItem(TOKEN_KEY);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
};

// ==================== Course Management APIs ====================

export interface ApiCourse {
  _id: string;
  name: string | { en: string };
  description: string | { en: string };
  category: string;
  image: string;
  slug?: string;
  status: "active" | "inactive";
  createdBy: ApiUser | string;
  createdAt?: string;
  updatedAt?: string;
}

export const CoursesAPI = {
  list: () => apiFetch<{ courses: ApiCourse[]; count: number }>("/admin/courses"),
  get: (id: string) => apiFetch<{ course: ApiCourse }>(`/admin/courses/${id}`),
  create: (payload: {
    name: string | { en: string };
    description?: string | { en: string };
    category?: string;
    image?: string;
    status?: "active" | "inactive";
  }) =>
    apiFetch<{ course: ApiCourse }>("/admin/courses", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  update: (id: string, payload: {
    name?: string | { en: string };
    description?: string | { en: string };
    category?: string;
    image?: string;
    status?: "active" | "inactive";
  }) =>
    apiFetch<{ course: ApiCourse }>(`/admin/courses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  delete: (id: string) =>
    apiFetch<{ success: boolean; message: string }>(`/admin/courses/${id}`, {
      method: "DELETE",
    }),
};

// ==================== Category Management APIs ====================

export interface ApiCategory {
  _id: string;
  name: string | { en: string };
  description?: string | { en: string };
  image?: string;
  slug?: string;
  status: "active" | "inactive";
  createdBy: ApiUser | string;
  createdAt?: string;
  updatedAt?: string;
}

export const CategoriesAPI = {
  list: (status?: "active" | "inactive") => {
    const query = status ? `?status=${status}` : "";
    return apiFetch<{ categories: ApiCategory[]; count: number }>(`/admin/categories${query}`);
  },
  get: (id: string) => apiFetch<{ category: ApiCategory }>(`/admin/categories/${id}`),
  create: (payload: {
    name: string | { en: string };
    description?: string | { en: string };
    image?: string;
    status?: "active" | "inactive";
  }) =>
    apiFetch<{ category: ApiCategory }>("/admin/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  update: (id: string, payload: {
    name?: string | { en: string };
    description?: string | { en: string };
    image?: string;
    status?: "active" | "inactive";
  }) =>
    apiFetch<{ category: ApiCategory }>(`/admin/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  delete: (id: string) =>
    apiFetch<{ success: boolean; message: string }>(`/admin/categories/${id}`, {
      method: "DELETE",
    }),
};

// ==================== Language Management APIs ====================

export interface ApiLanguage {
  _id: string;
  name: string | { en: string };
  code: string;
  nativeName: string | { en: string };
  flag: string;
  status: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}

export const LanguagesAPI = {
  list: () => apiFetch<{ languages: ApiLanguage[]; count: number }>("/admin/languages"),
  get: (id: string) => apiFetch<{ language: ApiLanguage }>(`/admin/languages/${id}`),
  create: (payload: {
    name: string;
    code: string;
    nativeName?: string;
    flag?: string;
    status?: "active" | "inactive";
  }) =>
    apiFetch<{ language: ApiLanguage }>("/admin/languages", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  update: (id: string, payload: {
    name?: string;
    code?: string;
    nativeName?: string;
    flag?: string;
    status?: "active" | "inactive";
  }) =>
    apiFetch<{ language: ApiLanguage }>(`/admin/languages/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  delete: (id: string) =>
    apiFetch<{ success: boolean; message: string }>(`/admin/languages/${id}`, {
      method: "DELETE",
    }),
};

// ==================== Teacher Course Management APIs ====================

export interface ApiTeacherCourse {
  _id: string;
  teacherId: ApiUser | string;
  courseId: ApiCourse | string;
  languageIds: ApiLanguage[] | string[];
  languageProficiencies?: Array<{
    languageId: string | ApiLanguage;
    code: string;
    proficiency: "native" | "c2" | "c1" | "b2" | "b1" | "a2" | "a1";
  }>;
  pricing: {
    basePriceUSD: number;
    baseCurrency: "USD";
    teacherPrice: number;
    teacherCurrency: string;
    exchangeRateAtCreation: number;
  };
  timezone: string;
  experience: string;
  bio: string;
  introductionVideo?: string;
  aboutCourse?: string;
  availability: Record<string, any>;
  status: "pending" | "approved" | "rejected";
  reviewedBy?: ApiUser | string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const TeacherCoursesAPI = {
  list: (params?: {
    status?: "pending" | "approved" | "rejected";
    courseId?: string;
    languageId?: string;
    teacherId?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    if (params?.courseId) query.append("courseId", params.courseId);
    if (params?.languageId) query.append("languageId", params.languageId);
    if (params?.teacherId) query.append("teacherId", params.teacherId);
    const queryString = query.toString();
    return apiFetch<{ teacherCourses: ApiTeacherCourse[]; count: number }>(
      `/admin/teacher-course${queryString ? `?${queryString}` : ""}`
    );
  },
  approve: (id: string) =>
    apiFetch<{ teacherCourse: ApiTeacherCourse; message: string }>(`/admin/teacher-course/${id}/approve`, {
      method: "PATCH",
    }),
  reject: (id: string, rejectionReason?: string) =>
    apiFetch<{ teacherCourse: ApiTeacherCourse; message: string }>(`/admin/teacher-course/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ status: "rejected", rejectionReason }),
    }),
  update: (id: string, payload: { customPlatformFeePercent?: number }) =>
    apiFetch<{ teacherCourse: ApiTeacherCourse; message: string }>(`/admin/teacher-course/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};

// ==================== Teacher Course Join APIs ====================

export const TeacherCourseJoinAPI = {
  getAvailableCourses: () => apiFetch<{ courses: ApiCourse[]; count: number }>("/teacher/available-courses"),
  getLanguages: () => apiFetch<{ languages: ApiLanguage[]; count: number }>("/teacher/languages"),
  joinCourse: (payload: {
    courseId: string;
    languageIds?: string[];
    languageCodes?: string[];
    languages?: Array<{
      code: string;
      proficiency: "native" | "c2" | "c1" | "b2" | "b1" | "a2" | "a1";
      name?: any;
      nativeName?: any;
    }>;
    teacherPrice: number;
    teacherCurrency: string;
    timezone?: string;
    introductionVideo?: string;
    experience?: string;
    bio?: string;
    aboutCourse?: string;
  }) =>
    apiFetch<{ teacherCourse: ApiTeacherCourse; message?: string }>("/teacher/course-join", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getMyCourses: (status?: "pending" | "approved" | "rejected") => {
    const query = status ? `?status=${status}` : "";
    return apiFetch<{ teacherCourses: ApiTeacherCourse[]; count: number }>(`/teacher/my-courses${query}`);
  },
  updateCourse: (id: string, payload: {
    languageIds?: string[];
    languageCodes?: string[];
    languages?: Array<{
      code: string;
      proficiency: "native" | "c2" | "c1" | "b2" | "b1" | "a2" | "a1";
      name?: any;
      nativeName?: any;
    }>;
    teacherPrice?: number;
    teacherCurrency?: string;
    timezone?: string;
    introductionVideo?: string;
    experience?: string;
    bio?: string;
    aboutCourse?: string;
  }) =>
    apiFetch<{ teacherCourse: ApiTeacherCourse; message: string }>(`/teacher/my-courses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  exitCourse: (id: string) =>
    apiFetch<{ message: string }>(`/teacher/my-courses/${id}`, {
      method: "DELETE",
    }),
};

// ==================== Student Course Browsing APIs ====================

export const StudentCoursesAPI = {
  getCourses: () => apiFetch<{ courses: ApiCourse[]; count: number }>("/courses"),
  getCourseLanguages: (courseId: string) =>
    apiFetch<{ languages: ApiLanguage[]; count: number }>(`/courses/${courseId}/languages`),
  getCourseTeachers: (courseId: string, languageId: string) =>
    apiFetch<{ teacherCourses: ApiTeacherCourse[]; count: number }>(
      `/courses/${courseId}/teachers?languageId=${languageId}`
    ),
};

// ==================== Availability Management APIs ====================

export interface ApiAvailability {
  _id: string;
  teacherId: ApiUser | string;
  courseId: ApiCourse | string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  pricing: {
    baseAmountUSD: number;
    baseCurrency: "USD";
  };
  timezone: string;
  status: "available" | "booked" | "blocked" | "cancelled";
  bookingId?: string;
  isRecurring: boolean;
  recurringPattern?: "daily" | "weekly" | "monthly" | null;
  recurringEndDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const AvailabilityAPI = {
  create: (payload: {
    courseId: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    timezone?: string;
    isRecurring?: boolean;
    recurringPattern?: "daily" | "weekly" | "monthly";
    recurringEndDate?: string;
  }) =>
    apiFetch<{ availability: ApiAvailability }>("/teacher/availability", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  bulkCreate: (payload: {
    courseId: string;
    slots: Array<{
      date: string;
      startTime: string;
      endTime: string;
      duration: number;
      timezone?: string;
    }>;
  }) =>
    apiFetch<{ availabilities: ApiAvailability[]; count: number }>("/teacher/availability/bulk", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getMyAvailability: (params?: {
    courseId?: string;
    startDate?: string;
    endDate?: string;
    status?: "available" | "booked" | "blocked" | "cancelled";
  }) => {
    const query = new URLSearchParams();
    if (params?.courseId) query.append("courseId", params.courseId);
    if (params?.startDate) query.append("startDate", params.startDate);
    if (params?.endDate) query.append("endDate", params.endDate);
    if (params?.status) query.append("status", params.status);
    const queryString = query.toString();
    return apiFetch<{ availabilities: ApiAvailability[]; count: number }>(
      `/teacher/availability${queryString ? `?${queryString}` : ""}`
    );
  },
  update: (id: string, payload: {
    startTime?: string;
    endTime?: string;
    duration?: number;
    status?: "available" | "booked" | "blocked" | "cancelled";
    timezone?: string;
  }) =>
    apiFetch<{ availability: ApiAvailability }>(`/teacher/availability/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  delete: (id: string) =>
    apiFetch<{ success: boolean; message: string }>(`/teacher/availability/${id}`, {
      method: "DELETE",
    }),
};

// ==================== Booking APIs ====================

export interface ApiBooking {
  _id: string;
  studentId: ApiUser | string;
  teacherId: ApiUser | string;
  teacherCourseId: ApiTeacherCourse | string;
  availabilityId: string;
  courseId: ApiCourse | string;
  languageId: ApiLanguage | string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  timezone: string;
  pricingSnapshot: {
    baseAmountUSD: number;
    baseCurrency: "USD";
    studentPaid: { amount: number; currency: string };
    teacherPayout: { amount: number; currency: string };
    exchangeRates: Record<string, number>;
    timestamp: string;
  };
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentId?: string;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  // Legacy fields (for backward compatibility)
  meetingType: "zoom" | "google_meet" | "teams" | "custom";
  meetingUrl: string;
  meetingId: string;
  meetingPassword: string;
  // New meeting object with dynamic Zoom links
  meeting?: {
    provider: "zoom";
    meetingId: string;
    joinUrlStudent: string;
    joinUrlTeacher: string;
  };
  cancelledBy?: ApiUser | string;
  cancelledAt?: string;
  cancellationReason?: string;
  studentNotes: string;
  teacherNotes: string;
  createdAt?: string;
  updatedAt?: string;
}

export const BookingAPI = {
  // Student APIs
  getAvailableSlots: (teacherCourseId: string, params?: { startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams();
    if (params?.startDate) query.append("startDate", params.startDate);
    if (params?.endDate) query.append("endDate", params.endDate);
    const queryString = query.toString();
    return apiFetch<{ availabilities: ApiAvailability[]; count: number }>(
      `/bookings/available-slots/${teacherCourseId}${queryString ? `?${queryString}` : ""}`
    );
  },
  create: (payload: { availabilityId: string; studentNotes?: string }) =>
    apiFetch<{ booking: ApiBooking; message: string }>("/bookings", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getMyBookings: (params?: {
    status?: "scheduled" | "completed" | "cancelled" | "no_show";
    startDate?: string;
    endDate?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    if (params?.startDate) query.append("startDate", params.startDate);
    if (params?.endDate) query.append("endDate", params.endDate);
    const queryString = query.toString();
    return apiFetch<{ bookings: ApiBooking[]; count: number }>(
      `/bookings/my-bookings${queryString ? `?${queryString}` : ""}`
    );
  },
  getBooking: (id: string) => apiFetch<{ booking: ApiBooking }>(`/bookings/${id}`),
  updateStatus: (id: string, payload: {
    status: "scheduled" | "completed" | "cancelled" | "no_show";
    cancellationReason?: string;
  }) =>
    apiFetch<{ booking: ApiBooking; message: string }>(`/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  // Teacher APIs
  getTeacherBookings: (params?: {
    status?: "scheduled" | "completed" | "cancelled" | "no_show";
    startDate?: string;
    endDate?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    if (params?.startDate) query.append("startDate", params.startDate);
    if (params?.endDate) query.append("endDate", params.endDate);
    const queryString = query.toString();
    return apiFetch<{ bookings: ApiBooking[]; count: number }>(
      `/teacher/bookings${queryString ? `?${queryString}` : ""}`
    );
  },
  updateMeetingDetails: (id: string, payload: {
    meetingType?: "zoom" | "google_meet" | "teams" | "custom";
    meetingUrl?: string;
    meetingId?: string;
    meetingPassword?: string;
  }) =>
    apiFetch<{ booking: ApiBooking; message: string }>(`/teacher/bookings/${id}/meeting`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  updateTeacherStatus: (id: string, payload: {
    status: "scheduled" | "completed" | "cancelled" | "no_show";
    teacherNotes?: string;
  }) =>
    apiFetch<{ booking: ApiBooking; message: string }>(`/teacher/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  // Admin APIs for live sessions / bookings
  getAdminLiveBookings: (params?: {
    status?: "scheduled" | "completed" | "cancelled" | "no_show";
    startDate?: string;
    endDate?: string;
    teacherId?: string;
    studentId?: string;
    courseId?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    if (params?.startDate) query.append("startDate", params.startDate);
    if (params?.endDate) query.append("endDate", params.endDate);
    if (params?.teacherId) query.append("teacherId", params.teacherId);
    if (params?.studentId) query.append("studentId", params.studentId);
    if (params?.courseId) query.append("courseId", params.courseId);
    const queryString = query.toString();
    return apiFetch<{ bookings: ApiBooking[]; count: number }>(
      `/admin/courses/live-bookings${queryString ? `?${queryString}` : ""}`
    );
  },
  adminUpdateMeetingDetails: (id: string, payload: {
    meetingType?: "zoom" | "google_meet" | "teams" | "custom";
    meetingUrl?: string;
    meetingId?: string;
    meetingPassword?: string;
  }) =>
    apiFetch<{ booking: ApiBooking; message: string }>(`/admin/courses/live-bookings/${id}/meeting`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};

// ==================== Lecture Management APIs ====================

export interface ApiLiveMeeting {
  provider: "google_meet" | "zoom" | "teams" | "custom";
  meetingUrl: string;
  meetingId?: string;
  scheduledAt?: string | null;
  duration?: number;
  status: "scheduled" | "live" | "completed" | "cancelled";
}

export interface ApiLecture {
  _id: string;
  courseId: string;
  title: string | { en: string };
  description?: string | { en: string };
  section: string;
  type: "recorded" | "live";
  videoUrl?: string;
  videoPublicId?: string;
  videoDuration?: number; // in minutes
  liveMeeting?: ApiLiveMeeting;
  order: number;
  isPreview: boolean;
  status: "active" | "draft" | "archived";
  createdBy?: ApiUser | string;
  createdAt?: string;
  updatedAt?: string;
}

export const LecturesAPI = {
  listByCourse: (courseId: string, params?: { type?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.type) query.append("type", params.type);
    if (params?.status) query.append("status", params.status);
    const queryString = query.toString();
    return apiFetch<{ lectures: ApiLecture[]; count: number }>(
      `/admin/courses/${courseId}/lectures${queryString ? `?${queryString}` : ""}`
    );
  },
  get: (id: string) => apiFetch<{ lecture: ApiLecture }>(`/admin/courses/lectures/${id}`),
  create: (courseId: string, payload: Partial<ApiLecture>) =>
    apiFetch<{ lecture: ApiLecture; message: string }>(`/admin/courses/${courseId}/lectures`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  update: (id: string, payload: Partial<ApiLecture>) =>
    apiFetch<{ lecture: ApiLecture; message: string }>(`/admin/courses/lectures/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  delete: (id: string) =>
    apiFetch<{ message: string }>(`/admin/courses/lectures/${id}`, {
      method: "DELETE",
    }),
  reorder: (lectures: Array<{ id: string; order: number }>) =>
    apiFetch<{ message: string }>("/admin/courses/lectures/reorder", {
      method: "PATCH",
      body: JSON.stringify({ lectures }),
    }),
  uploadVideo: (courseId: string, file: File, onProgress?: (percentage: number) => void) => {
    return new Promise<{ videoUrl: string; videoPublicId: string; videoDuration: number; message: string }>(
      (resolve, reject) => {
        const cloudName = import.meta.env.VITE_APP_CLOUD_NAME || "di4pzesyi";
        const uploadPreset = import.meta.env.VITE_APP_CLOUDINARY_UPLOAD_PRESET || "VOLTOMATIC_CLOUDINARY_UPLOAD_PRESET";

        const uploadViaBackend = () => {
          const token = getToken();
          const formData = new FormData();
          formData.append("video", file);
          const xhr = new XMLHttpRequest();
          xhr.open("POST", `${API_URL}/admin/courses/${courseId}/lectures/upload-video`);
          if (token) {
            xhr.setRequestHeader("Authorization", `Bearer ${token}`);
          }

          if (xhr.upload && onProgress) {
            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                onProgress(percent);
              }
            };
          }

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText);
                resolve(data);
              } catch (err) {
                reject(err);
              }
            } else {
              try {
                const errorData = JSON.parse(xhr.responseText);
                reject(new Error(errorData.message || errorData.error?.message || `Upload failed with status ${xhr.status}`));
              } catch {
                reject(new Error(`Upload failed with status ${xhr.status}`));
              }
            }
          };

          xhr.onerror = () => reject(new Error("Network error during video upload"));
          xhr.send(formData);
        };

        // Try direct Cloudinary CDN upload first with verified upload preset
        if (cloudName && uploadPreset) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", uploadPreset);
          formData.append("folder", "edunyte/course_lectures");

          const xhr = new XMLHttpRequest();
          xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`);

          if (xhr.upload && onProgress) {
            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                onProgress(percent);
              }
            };
          }

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText);
                const durationMinutes = data.duration ? Math.round((data.duration / 60) * 10) / 10 : 0;
                resolve({
                  videoUrl: data.secure_url || data.url,
                  videoPublicId: data.public_id,
                  videoDuration: durationMinutes,
                  message: "Video uploaded successfully",
                });
              } catch (err) {
                reject(err);
              }
            } else {
              console.warn("Direct Cloudinary upload failed, falling back to backend upload:", xhr.responseText);
              uploadViaBackend();
            }
          };

          xhr.onerror = () => {
            console.warn("Direct Cloudinary upload network error, falling back to backend upload");
            uploadViaBackend();
          };

          xhr.send(formData);
        } else {
          uploadViaBackend();
        }
      }
    );
  },
};


