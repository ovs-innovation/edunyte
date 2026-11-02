const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface CreateOrderParams {
  itemType?: 'lesson' | 'course' | 'subscription' | 'test-series' | 'product';
  teacherId?: string;
  courseId?: string;
  availabilityId?: string;
  duration?: number;
  studentCount?: number;
  selectedSlot?: { availabilityId: string };
  itemId?: string;
  planId?: string;
  notes?: Record<string, any>;
}

export interface CreateOrderResponse {
  success: boolean;
  orderId: string;
  order: {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
  };
  keyId: string;
  amount: number; // in INR rupees
  amountPaise: number;
  currency: string;
  item: {
    type: string;
    name: string;
    reference?: any;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
  pricing?: any;
  message?: string;
}

export interface VerifyPaymentParams {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  orderId: string;
  paymentId: string;
  status: string;
  amount: number;
  currency: string;
  service?: {
    type: string;
    bookingId?: string;
    sessionDate?: string;
    startTime?: string;
    endTime?: string;
    meetingUrl?: string | null;
    [key: string]: any;
  };
  bookingId?: string;
  alreadyProcessed?: boolean;
}

export interface PaymentStatusResponse {
  success: boolean;
  orderId: string;
  status: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded';
  amount: number;
  currency: string;
  item?: {
    type: string;
    name: string;
    duration?: number;
    studentCount?: number;
  };
  paymentDetails?: {
    gateway: string;
    paymentId: string | null;
    method: string | null;
    paidAt: string | null;
  };
  booking?: {
    id: string;
    status: string;
    sessionDate: string;
    startTime: string;
    endTime: string;
    timezone?: string;
    meeting?: {
      provider: string;
      joinUrlStudent: string | null;
    };
  } | null;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Load official Razorpay Checkout.js script dynamically
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      return resolve(true);
    }

    const existingScript = document.getElementById('razorpay-checkout-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-checkout-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay Checkout.js SDK');
      resolve(false);
    };

    document.body.appendChild(script);
  });
};

/**
 * Call Create Razorpay Order API on the backend
 */
export const createRazorpayOrder = async (
  params: CreateOrderParams,
  token?: string | null
): Promise<CreateOrderResponse> => {
  const response = await fetch(`${API_BASE_URL}/payment/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(params),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Failed to create payment order');
  }

  return data;
};

/**
 * Call Backend Payment Verification API
 */
export const verifyRazorpayPayment = async (
  params: VerifyPaymentParams,
  token?: string | null
): Promise<VerifyPaymentResponse> => {
  const response = await fetch(`${API_BASE_URL}/payment/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(params),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Payment verification failed');
  }

  return data;
};

/**
 * Fetch Payment Status by Order ID
 */
export const getPaymentStatus = async (
  orderId: string,
  token?: string | null
): Promise<PaymentStatusResponse> => {
  const response = await fetch(`${API_BASE_URL}/payment/status/${orderId}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch payment status');
  }

  return data;
};

