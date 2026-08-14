"use client";

import { usePathname } from "next/navigation";
import { useCurrentUser } from "@/components/CurrentUserProvider";

// Pages rebuilt as Folio sheets carry their own chrome (status bar + in-sheet
// nav), so the global Navbar/Footer must stay off them. Transitional: the gate
// and the route list die when the last classic page migrates to the sheet.
const FOLIO_ROUTES = new Set(["/list"]);

export default function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentUser = useCurrentUser();
  // "/" is a sheet only when signed in — the guest landing page keeps the
  // classic chrome until its own pass.
  const folio =
    FOLIO_ROUTES.has(pathname) || (pathname === "/" && currentUser !== null);
  if (folio) return null;
  return <>{children}</>;
}
