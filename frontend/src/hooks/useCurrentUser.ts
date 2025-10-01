import { useMemo } from "react";
import { getCurrentUser } from "../features/auth/auth";

/** Returnerar { name } eller null, memoiserat en gång per mount. */
export function useCurrentUserName(): string | null {
  return useMemo(() => getCurrentUser()?.name ?? null, []);
}
