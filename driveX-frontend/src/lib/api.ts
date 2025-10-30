export const API_BASE = "http://localhost:8080/api";

export const IS_MOCK = false;

export async function apiFetch<T>(
  path: string,
  opts: RequestInit = {},
  token?: string | null
): Promise<T> {
  const url = `${API_BASE}${path}`;

  const headers: Record<string, string> = {
    ...(opts.headers as Record<string, string>),
  };

  // Only set Content-Type to application/json if we're not sending FormData
  if (!(opts.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...opts,
    headers,
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Network error" }));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth API functions
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  name: string;
  email: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const authAPI = {
  login: async (
    credentials: LoginRequest
  ): Promise<ApiResponse<AuthResponse>> => {
    return apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  register: async (
    userData: RegisterRequest
  ): Promise<ApiResponse<AuthResponse>> => {
    return apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  getCurrentUser: async (token: string): Promise<ApiResponse<any>> => {
    return apiFetch(
      "/auth/me",
      {
        method: "GET",
      },
      token
    );
  },

  changePassword: async (
    data: { oldPassword: string; newPassword: string },
    token: string
  ): Promise<ApiResponse<string>> => {
    return apiFetch(
      "/auth/change-password",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token
    );
  },

  googleAuth: async (data: {
    accessToken: string;
    refreshToken: string;
  }): Promise<ApiResponse<AuthResponse>> => {
    return apiFetch("/auth/google", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  forgotPassword: async (email: string): Promise<ApiResponse<string>> => {
    return apiFetch("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (
    token: string,
    newPassword: string
  ): Promise<ApiResponse<string>> => {
    return apiFetch("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    });
  },
};

// File API functions
export interface FileItem {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  kind: string;
  description?: string;
  isPreviewable?: boolean;
}

export interface FileListResponse {
  page: number;
  size: number;
  total: number;
  files: FileItem[];
}

export const fileAPI = {
  upload: async (
    file: File,
    description?: string,
    token?: string
  ): Promise<ApiResponse<FileItem>> => {
    const formData = new FormData();
    formData.append("file", file);
    if (description) formData.append("description", description);

    return apiFetch(
      "/files/upload",
      {
        method: "POST",
        body: formData,
        headers: {}, // Remove Content-Type to let browser set it for FormData
      },
      token
    );
  },

  list: async (
    page = 0,
    size = 20,
    type = "all",
    search?: string,
    token?: string
  ): Promise<ApiResponse<FileListResponse>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      type,
    });
    if (search) params.append("search", search);

    return apiFetch(
      `/files?${params.toString()}`,
      {
        method: "GET",
      },
      token
    );
  },

  getFile: async (
    id: string,
    token?: string
  ): Promise<ApiResponse<FileItem>> => {
    return apiFetch(
      `/files/${id}`,
      {
        method: "GET",
      },
      token
    );
  },

  deleteFile: async (
    id: string,
    token?: string
  ): Promise<ApiResponse<string>> => {
    return apiFetch(
      `/files/${id}`,
      {
        method: "DELETE",
      },
      token
    );
  },

  getStorageUsage: async (
    token?: string
  ): Promise<ApiResponse<{ storageUsed: number }>> => {
    return apiFetch(
      "/files/usage",
      {
        method: "GET",
      },
      token
    );
  },
};
