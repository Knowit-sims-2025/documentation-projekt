// src/services/auth.ts
export type MeUser = {
  id: number;
  displayName: string;
  avatarUrl?: string | null;
  confluenceAuthorId: string;
  totalPoints: number;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  rankTier?: string;
};

const TOKEN_KEY = "dq_jwt";
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export function logout() {
  clearToken();
}

/**
 * POST /auth/login → { token }
 * Sparar token lokalt vid framgång.
 */
export async function login(confluenceAuthorId: string): Promise<string> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ confluenceAuthorId }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as { token: string };
  setToken(data.token);
  return data.token;
}

/** GET /me → info om inloggad användare (kräver Authorization) */
export async function getMe(): Promise<MeUser> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/me`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error(`Failed to fetch /me (${res.status})`);
  return res.json();
}

/** Skyddade anrop: lägger till Authorization-header automatiskt. */
export async function authFetch(input: RequestInfo, init: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
