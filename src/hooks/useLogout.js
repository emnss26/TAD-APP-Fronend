import { useCallback } from "react";
import useApiFetch from "./useApiFetch";

export default function useLogout() {
  const apiFetch = useApiFetch();
  return useCallback(async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch (err) {
      console.error("Error logging out:", err);
    }
  }, [apiFetch]);
}
