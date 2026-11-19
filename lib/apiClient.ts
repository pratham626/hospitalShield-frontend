import { LocalStore } from "./localStore";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

let isBackendOnline = false;

export function getBackendStatus(): boolean {
  return isBackendOnline;
}

export function setBackendStatus(status: boolean) {
  isBackendOnline = status;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("backend-status-change", { detail: { online: status } }));
  }
}

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  skipFallback?: boolean;
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<{ data: T; isFallback: boolean }> {
  const { timeoutMs = 2500, skipFallback = false, ...fetchOptions } = options;

  // Check if force demo mode is toggled on
  if (typeof window !== "undefined" && LocalStore.getForceDemoMode() && !skipFallback) {
    return { data: null as any, isFallback: true };
  }

  const url = `${API_BASE_URL.replace(/\/$/, "")}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const token = LocalStore.getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!isBackendOnline) {
      setBackendStatus(true);
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: response.statusText }));
      if (response.status === 401) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth-unauthorized"));
        }
      }
      throw new ApiError(errorBody.message || "API request failed", response.status, errorBody);
    }

    const data = await response.json();
    return { data, isFallback: false };
  } catch (err: any) {
    clearTimeout(timeoutId);

    if (err instanceof ApiError) {
      // It was an actual HTTP error from the server (e.g., 403 Forbidden, 400 Bad Request, 401 Unauthorized)
      // Do not fallback silently if the server actively returned 403/401/400!
      throw err;
    }

    // Network failure, connection refused, or timeout
    if (isBackendOnline) {
      setBackendStatus(false);
    }

    if (skipFallback) {
      throw err;
    }

    // Indicate that backend was unreachable and request is served by local engine
    return { data: null as any, isFallback: true };
  }
}
