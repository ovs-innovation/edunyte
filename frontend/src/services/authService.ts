const API_BASE_URL = "/api";

// ================= TYPES =================
export interface LoginCredentials {
  email: string;
  password: string;
  otp?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    permissions: string[];
    status: string;
    photo?: string;
    avatar?: string;
    image?: string;
  };
}

export interface OTPResponse {
  requiresOTP: boolean;
  message: string;
}

// ================= LOGIN =================
export const login = async (
  credentials: LoginCredentials
): Promise<AuthResponse | OTPResponse> => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const response = await fetch(`${API_BASE_URL}/auth/login?appType=student`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Timezone": timezone,
    },
    body: JSON.stringify({
      ...credentials,
      timezone,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
};

// ================= REGISTER =================
export const register = async (
  userData: RegisterData
): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...userData,
      role: userData.role || "student",
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
  }

  return data;
};

// ================= TOKEN STORAGE =================
export const getStoredToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

export const setStoredToken = (token: string): void => {
  localStorage.setItem("auth_token", token);
};

export const removeStoredToken = (): void => {
  localStorage.removeItem("auth_token");
};

export const getStoredUser = (): AuthResponse["user"] | null => {
  const userStr = localStorage.getItem("auth_user");
  return userStr ? JSON.parse(userStr) : null;
};

export const setStoredUser = (user: AuthResponse["user"]): void => {
  localStorage.setItem("auth_user", JSON.stringify(user));
};

export const removeStoredUser = (): void => {
  localStorage.removeItem("auth_user");
};

// ================= PROFILE =================
export const updateProfile = async (data: any) => {
  const token = getStoredToken();

  const response = await fetch(`${API_BASE_URL}/student-profiles/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const resData = await response.json();

  if (!response.ok) {
    throw new Error(resData.message || "Update failed");
  }

  return resData;
};

// ================= VALIDATE TOKEN =================
export const validateToken = async () => {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      removeStoredToken();
      removeStoredUser();
      return null;
    }

    const data = await response.json();
    return data.user || data;
  } catch {
    return null;
  }
};

// ================= GOOGLE LOGIN =================
export const googleLogin = async (
  credential: string,
  role?: string,
  isAccessToken?: boolean
): Promise<AuthResponse> => {
  const body: any = { role };

  if (isAccessToken) {
    body.accessToken = credential;
  } else {
    body.credential = credential;
  }

  const response = await fetch(`${API_BASE_URL}/auth/google-login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Google login failed");
  }

  return data;
};

// export const firebaseLogin = async (token: string, role?: string): Promise<AuthResponse> => {
//   const response = await fetch(`${API_BASE_URL}/auth/firebase-login`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ token, role }),
//   });

//   const data = await response.json();

//   if (!response.ok) {
//     throw new Error(data.message || "Firebase login failed");
//   }

//   return data;
// };
