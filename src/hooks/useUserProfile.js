import { useState, useEffect } from "react";
import useApiFetch from "./useApiFetch";

export default function useUserProfile() {
  const apiFetch = useApiFetch();
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch("/general/userprofile")
      .then((data) => setUserProfile(data.user))
      .catch((err) => {
        console.error("Error fetching user profile:", err);
        setError(err.message);
      });
  }, [apiFetch]);

  return { userProfile, error };
}
