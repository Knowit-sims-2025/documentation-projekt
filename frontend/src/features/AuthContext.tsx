import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "../types/user";
import { getUsers } from "../services/users";

interface AuthContextType {
  currentUser: User | null;
  allUsers: User[];
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const users = await getUsers();
        setAllUsers(users);

        // 🔍 Leta efter Tony Stark baserat på displayName (skiftlägesokänsligt)
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

  const value = useMemo(
    () => ({ currentUser, allUsers, isLoading }),
    [currentUser, allUsers, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
