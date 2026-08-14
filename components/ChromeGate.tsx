"use client";

import { usePathname } from "next/navigation";

// Pages rebuilt as Folio sheets carry their own chrome (status bar + in-sheet
// nav), so the global Navbar/Footer must stay off them. Transitional: the gate
// and the route list die when the last classic page migrates to the sheet.
const FOLIO_ROUTES = new Set(["/", "/list", "/browse", "/stats"]);
const FOLIO_PATTERNS = [
  /^\/novel\//,
  /^\/author\/[^/]+$/,
  /^\/character\/[^/]+$/,
  /^\/user\/[^/]+$/,
  /^\/sign-in/,
  /^\/sign-up/,
  /^\/settings/,
  /^\/admin/,
];

export default function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const folio =
    FOLIO_ROUTES.has(pathname) || FOLIO_PATTERNS.some((p) => p.test(pathname));
  if (folio) return null;
  return <>{children}</>;
}
