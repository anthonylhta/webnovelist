"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { useCurrentUser } from "@/components/CurrentUserProvider";

// The in-sheet nav row — Folio pages carry their own navigation (the global
// Navbar is gated off them), in the lobby idiom: mono links with trailing
// slashes, the current page in gold.

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`transition ${active ? "text-gold" : "text-muted hover:text-gold"}`}
    >
      {label}/
    </Link>
  );
}

export default function FolioNav() {
  const currentUser = useCurrentUser();
  const pathname = usePathname();
  const { signOut } = useClerk();

  const left = [
    { href: "/", label: "home" },
    { href: "/browse", label: "browse" },
    ...(currentUser
      ? [
          { href: "/list", label: "library" },
          { href: "/stats", label: "stats" },
          { href: `/user/${currentUser.username}`, label: "profile" },
        ]
      : []),
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-hairline px-4 py-2.5 font-mono text-xs">
      {left.map((item) => (
        <NavLink
          key={item.href}
          href={item.href}
          label={item.label}
          active={pathname === item.href}
        />
      ))}
      <span className="flex-1" />
      {currentUser ? (
        <>
          <NavLink href="/settings" label="settings" active={pathname === "/settings"} />
          {currentUser.role === "admin" && (
            <NavLink href="/admin" label="admin" active={pathname.startsWith("/admin")} />
          )}
          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            className="text-muted transition hover:text-seal-bright"
            title="Sign out"
          >
            [exit]
          </button>
        </>
      ) : (
        <>
          <NavLink href="/sign-in" label="sign-in" active={false} />
          <NavLink href="/sign-up" label="sign-up" active={false} />
        </>
      )}
    </div>
  );
}
