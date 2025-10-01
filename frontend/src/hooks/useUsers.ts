// src/hooks/useUsers.ts
import { useEffect, useState } from "react";
import type { User } from "../types/user";
import { getUsers } from "../services/users";

export function useUsers() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const users = await getUsers();
      setData(users);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Okänt fel vid hämtning");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    (async () => {
      await load();
    })();
    return () => { active = false };
    // active här skyddar främst mot framtida tillägg—enkelt att lämna kvar
  }, []);

  return { data, loading, error, refetch: load };
}
