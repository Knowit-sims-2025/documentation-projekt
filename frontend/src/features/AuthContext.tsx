import React, {
  createContext,
  useState,
  useContext,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import type { User } from "../types/user";

import { getUsers } from "../services/users";

/**

 */
interface AuthContextType {
  currentUser: User | null;
  allUsers: User[]; // Exponera hela användarlistan
  isLoading: boolean; // För att veta när vi verifierar sessionen
  login: (userId: number) => Promise<void>;
  logout: () => void;
}

/**
 * Skapar själva kontexten.
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Skapar en "Provider" som kommer att hålla i autentiserings-state..
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]); // State för alla användare
  const [isLoading, setIsLoading] = useState(true); // Startar som true

  // Körs när appen startar för att sätta en default-användare (er fallback)
  useEffect(() => {
    const fetchInitialUser = async () => {
      try {
        // Hämta listan EN GÅNG och spara den i state
        const users = await getUsers();
        setAllUsers(users);
        //Tony Stark har ID 1 så vi sätter honom som inloggad
        const initialUser = users.find((u) => u.id === 1);
        setCurrentUser(initialUser || null);
      } catch (error) {
        console.error("Failed to fetch initial user:", error);
        setCurrentUser(null); // Sätt till null om något går fel
      } finally {
        setIsLoading(false); // Sätts till false oavsett resultat
      }
    };

    fetchInitialUser();
  }, []);

  // Funktion för att "logga in" en användare genom att byta ID
  const login = useCallback(
    async (userId: number) => {
      setIsLoading(true);
      try {
        // Använd den redan hämtade listan för att hitta användaren
        const userToLogin = allUsers.find((u) => u.id === userId);
        setCurrentUser(userToLogin || null);
      } finally {
        setIsLoading(false);
      }
    },
    [allUsers]
  ); // Beroende av allUsers

  // Funktion för att logga ut
  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  // useMemo säkerställer att kontext-värdet bara skapas om när datan ändras.
  const value = useMemo(
    () => ({ currentUser, allUsers, isLoading, login, logout }),
    [currentUser, allUsers, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * En egen "hook" för att enkelt komma åt användardatan.
 * Istället för att skriva `useContext(AuthContext)` överallt,
 * kan vi nu bara skriva `useAuth()`.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
