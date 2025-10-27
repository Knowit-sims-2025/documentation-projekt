import { useState, useEffect } from "react";
import type { User } from "../../types/types";
import { getMe } from "../../services/users";

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        setLoading(true);
        const currentUser = await getMe();
        setUser(currentUser);
      } catch (e: any) {
        setError(e.message || "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchCurrentUser();
  }, []);

  return { user, loading, error };
}