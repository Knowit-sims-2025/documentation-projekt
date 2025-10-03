import React, { createContext, useState, useContext, useMemo } from "react";
import type { User } from "../types/user";

/**
 * En fallback-användare för utveckling, precis som du önskade.
 * Detta gör att appen fungerar även innan inloggningsflödet är klart.
 */
const fallbackUser: User = {
  id: 99, // Ett ID som troligtvis inte finns i databasen
  displayName: "Tony Stark",
  avatarUrl: "https://i.imgur.com/3oTAbjT.jpeg", // En rolig placeholder
  totalPoints: 5000,
  rank: 1,
  rankTier: "Master",
  isAdmin: true,
};

/**
 * Definierar vad vår UserContext kommer att innehålla.
 */
interface UserContextType {
  currentUser: User | null;
  // I framtiden skulle denna funktion ta emot ett ID från SSO-inloggningen.
  // För nu simulerar vi det genom att kunna byta användare manuellt.
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
}

/**
 * Skapar själva kontexten.
 */
const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 * Skapar en "Provider" som kommer att hålla i användardatan.
 * Denna komponent slår du runt din applikation.
 */
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(fallbackUser);

  // useMemo säkerställer att kontext-värdet bara ändras när datan faktiskt ändras.
  const value = useMemo(() => ({ currentUser, setCurrentUser }), [currentUser]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

/**
 * En egen "hook" för att enkelt komma åt användardatan.
 * Istället för att skriva `useContext(UserContext)` överallt,
 * kan vi nu bara skriva `useUser()`.
 */
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
