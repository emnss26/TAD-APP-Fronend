import { useCallback } from "react";

const backendUrl =
  import.meta.env.VITE_API_BACKEND_BASE_URL || "http://localhost:3000";

export default function useApiFetch() {
  return useCallback(async (endpoint, options = {}) => {
    const url = endpoint.startsWith("http") ? endpoint : `${backendUrl}${endpoint}`;
    const response = await fetch(url, { credentials: "include", ...options });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.message || response.statusText || "API Error";
      throw new Error(message);
    }
    return response.json();
  }, []);
}
