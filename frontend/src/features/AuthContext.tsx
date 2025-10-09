import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "../types/user";
import { getUsers } from "../services/users";

/**
 * Typ för det värde som exponeras via Context.
 */
interface AuthContextType {
  currentUser: User | null;
  allUsers: User[];
  isLoading: boolean;
  updateCurrentUserAvatar: (newAvatarUrl: string) => void;
}

/**
 * Skapa Context. Vi börjar med undefined så att hooken kan upptäcka fel användning.
 * (Dvs kasta om man glömmer wrappa med <AuthProvider>.)
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider som:
 * 1) Hämtar alla användare
 * 2) Väljer en “currentUser” (Tony Stark om finns, annars första)
 * 3) Exponerar { currentUser, allUsers, isLoading } via Context
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  //Intern state för nuvarande användare, lista ohc ladd-status
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Körs en gång vid mount:
   * - hämtar användare
   * - sätter allUsers
   * - sätter currentUser (Tony om möjligt, annars första, annars null)
   * - slår av isLoading
   *
   * Obs: kan behöva lägga till dependencies om vi ska uppdatera
   */
  useEffect(() => {
    const init = async () => {
      try {
        const users = await getUsers();
        setAllUsers(users);

        // Leta efter Tony Stark baserat på displayName (skiftlägesokänsligt)
        const tony =
          users.find(
            (u) =>
              u.displayName &&
              u.displayName.trim().toLowerCase() === "tony stark"
          ) ??
          users.find(
            (u) =>
              u.displayName &&
              u.displayName.toLowerCase().includes("tony") &&
              u.displayName.toLowerCase().includes("stark")
          ) ??
          users[0] ?? // fallback till första användaren om Tony inte hittas
          null;

        setCurrentUser(tony);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // Funktion för att uppdatera nuvarande användares avatar
  const updateCurrentUserAvatar = (newAvatarUrl: string) => {
    setCurrentUser((prevUser) => {
      if (!prevUser) return null;
      // Returnera en ny user-objekt med den uppdaterade URL:en
      return { ...prevUser, avatarUrl: newAvatarUrl };
    });

    // Uppdatera även användaren i den globala listan `allUsers`
    setAllUsers((prevAllUsers) =>
      prevAllUsers.map((user) => {
        if (currentUser && user.id === currentUser.id) {
          return { ...user, avatarUrl: newAvatarUrl };
        }
        return user;
      })
    );
  };

  /**
   * Memoisera context-värdet så att konsumenter inte re-renderar i onödan
   * (bara när någon av dep ändras).
   */
  const value = useMemo(
    () => ({ currentUser, allUsers, isLoading, updateCurrentUserAvatar }),
    [currentUser, allUsers, isLoading]
  );

  // Wrappa barn i providern
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Konsument-hook:
 * - Säkerställer användning inom Provider
 * - Ger enkel åtkomst till currentUser/allUsers/isLoading
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
