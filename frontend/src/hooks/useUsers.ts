import { useEffect, useState } from "react";
import type { User } from "../types/user";
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
  async function load() {
    try {
      setLoading(true); // sätt loading till true när vi börjar hämta
      setError(null); // återställ felmeddelandet innan ny hämtning
      const users = await getUsers(); // hämta användare från API
      setData(users); // sätt den hämtade datan i state
    } catch (e) {
      // om ett fel uppstår, sätt felmeddelandet i state
      setError(e instanceof Error ? e.message : "Okänt fel vid hämtning");
    } finally {
      setLoading(false); // sätt loading till false när hämtningen är klar
    }
  }

  //körs en gång när hooken används
  useEffect(() => {
    let active = true; // skyddar mot state-uppdatering efter unmount
    (async () => {
      await load();
    })();

    // städar upp vid unmount och sätter den som inaktiv
    return () => { active = false };
    // OBS: active används inte just nu, men kan vara bra att ha kvar
    // om vi senare vill förhindra setState vid unmount (t.ex. vid långsamma requests)
  }, []);

  // Returnerar all nödvändig data + funktion för manuell "refetch"
  return { data, loading, error, refetch: load };
}
