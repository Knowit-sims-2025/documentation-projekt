import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "../../types/types";
import { getUsers } from "../../services/users";
import {
  getMe,
  login as doLogin,
  logout as doLogout,
  clearToken,
  getToken,
} from "../../services/auth";
import { getRankTier } from "../../services/config/rank";
import type { MeUser } from "../../services/auth";

interface AuthContextType {
  currentUser: User | null;
  allUsers: User[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (confluenceAuthorId: string) => Promise<void>;
  logout: () => void;
  updateCurrentUserAvatar: (newAvatarUrl: string) => void; // ← NYTT
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Mapper: /me → User (kan byggas ut när /me returnerar mer) */
function mapMeToUser(me: MeUser): User {
  const totalPoints = me.totalPoints ?? 0;
  const rankTier = me.rankTier ?? getRankTier(totalPoints);

  return {
    id: me.id,
    displayName: me.displayName,
    avatarUrl: me.avatarUrl ?? undefined,
    totalPoints,
    isAdmin: !!me.isAdmin,
    createdAt: me.createdAt,
    rankTier,
  } as User;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Viktigt: auth = finns verklig user (inte bara token i localStorage)
  const isAuthenticated = !!currentUser;

  // Bootstrap vid mount
  useEffect(() => {
    (async () => {
      try {
        if (getToken()) {
          const me = await getMe();
          setCurrentUser(mapMeToUser(me));
          const users = await getUsers();
          setAllUsers(users);
        }
      } catch {
        clearToken();
        setCurrentUser(null);
        setAllUsers([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (confluenceAuthorId: string) => {
    setIsLoading(true);
    try {
      await doLogin(confluenceAuthorId);
      const me = await getMe();
      setCurrentUser(mapMeToUser(me));
      const users = await getUsers();
      setAllUsers(users);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    doLogout();
    setCurrentUser(null);
    setAllUsers([]);
  };

  /** Uppdatera avatar lokalt efter lyckad upload */
  const updateCurrentUserAvatar = (newAvatarUrl: string) => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, avatarUrl: newAvatarUrl };
      // Spegla även i allUsers
      setAllUsers((prevAll) =>
        prevAll.map((u) =>
          u.id === prev.id ? { ...u, avatarUrl: newAvatarUrl } : u
        )
      );
      return next;
    });
  };

  const value = useMemo(
    () => ({
      currentUser,
      allUsers,
      isLoading,
      isAuthenticated,
      login,
      logout,
      updateCurrentUserAvatar,
    }),
    [currentUser, allUsers, isLoading, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
