import { useEffect, useState } from "react";
import type { User } from "../types/user"; // Importera User-typen
import { getUsers } from "../services/users";


//en hook för att hämta användare
export function useUsers() {
  //state för data, loading och error
  const [data, setData] = useState<User[]>([]);
  //state för loading och error
  const [loading, setLoading] = useState(true);
  //state för felmeddelande
  const [error, setError] = useState<string | null>(null);

  //funktion för att hämta alla användare
  const load = async (isInitialLoad = false) => {
    // Visa bara den stora laddningsindikatorn vid första hämtningen
    if (isInitialLoad) {
      setLoading(true);
    }
    setError(null);

    try {
      const users = await getUsers();
      // Använd en funktionell state-uppdatering för att undvika race conditions
      // om en ny hämtning startar innan den förra är klar.
      setData(users);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Okänt fel vid hämtning");
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  };

  //körs en gång när hooken används
  useEffect(() => {
    // 1. Hämta data direkt vid mount
    load(true);

    // 2. Starta en timer som hämtar data var 30:e sekund
    const intervalId = setInterval(() => {
      load(false);
    }, 30000); //uppdaterar var 30 sek

    // 3. Städa upp: rensa timern när komponenten avmonteras
    return () => clearInterval(intervalId);
  }, []);

  // Returnerar all nödvändig data + funktion för manuell "refetch"
  return { data, loading, error, refetch: load };
}
