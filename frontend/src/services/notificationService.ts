const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface AppNotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'session_reminder' | 'booking' | 'approval' | 'payment' | 'system';
  data?: {
    bookingId?: string;
    courseId?: string;
    meetingUrl?: string;
    scheduledAt?: string;
  };
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  notifications: AppNotification[];
  unreadCount: number;
  total: number;
  page: number;
  totalPages: number;
}

export const getMyNotifications = async (token: string, page = 1, limit = 20): Promise<NotificationsResponse> => {
  const response = await fetch(`${API_BASE_URL}/notifications?page=${page}&limit=${limit}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }

  return response.json();
};

export const markNotificationAsRead = async (id: string, token: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to mark notification as read');
  }
};

export const markAllNotificationsAsRead = async (token: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to mark all notifications as read');
  }
};
