"use client";

import { createContext, useContext } from "react";

export type CurrentUser = {
  id: string;
  username: string;
  role: string;
  avatarUrl: string | null;
} | null;

const CurrentUserContext = createContext<CurrentUser>(null);

export function CurrentUserProvider({
  value,
  children,
}: {
  value: CurrentUser;
  children: React.ReactNode;
}) {
  return (
    <CurrentUserContext.Provider value={value}>
      {children}
    </CurrentUserContext.Provider>
  );
}

// DB-backed view of the signed-in user (id, username, role, avatar).
// Returns null when signed out. Use Clerk's useAuth()/useUser() for reactive
// auth state; use this for app-owned fields like role.
export function useCurrentUser(): CurrentUser {
  return useContext(CurrentUserContext);
}
