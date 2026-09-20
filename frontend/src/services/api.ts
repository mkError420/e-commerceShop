// Unified API Client for Bangladeshi E-Commerce Platform
// Provides seamless communication with Backend API with automatic authorization headers

const API_BASE_URL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE_URL) ||
  (typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
    ? import.meta?.env?.VITE_API_BASE_URL || "https://your-backend-url.vercel.app/api/v1" // Production - use env var or fallback
    : "http://localhost:5000/api/v1");

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...restOptions } = options;

  // If no backend URL available (production without backend), return fallback immediately
  if (!API_BASE_URL) {
    console.warn("[API] No backend URL configured, using local storage fallback");
    return {
      success: true,
      data: [],
      customers: [],
      admins: [],
      products: [],
      categories: [],
      orders: [],
      message: "Backend not deployed, using local storage",
    } as unknown as T;
  }

  let url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  if (params) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.append(key, String(value));
      }
    });
    const queryString = query.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      headers: {
        ...defaultHeaders,
        ...headers,
      },
      ...restOptions,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      // In static frontend deployments (e.g. Vercel without backend),
      // return a graceful fallback so StoreContext smoothly uses local/mock storage
      if (response.status >= 500 || response.status === 404) {
        return {
          success: false,
          data: [],
          customers: [],
          admins: [],
          products: [],
          categories: [],
          orders: [],
          message: "Backend offline, using local store",
        } as unknown as T;
      }

      throw new ApiError(
        response.status,
        data?.message || `Request failed with status ${response.status}`,
        data
      );
    }

    return data as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    // Network offline fallback - return success but with empty data to allow local state to work
    console.warn("[API] Backend unreachable, using local storage fallback:", err?.message);
    return {
      success: true,
      data: [],
      customers: [],
      admins: [],
      products: [],
      categories: [],
      orders: [],
      message: "Backend service unreachable, using local store",
    } as unknown as T;
  }
}

export default apiClient;
