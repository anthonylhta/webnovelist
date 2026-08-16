"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ReactNode } from "react";

// The mono section row shared by the curation sheets: users · titles ·
// authors · submissions, the active one in gold, a pending-submissions count
// beside the desk, and a page-specific action on the right.

export type AdminSection = "users" | "titles" | "authors" | "submissions";

const SECTIONS: { key: AdminSection; href: string; label: string }[] = [
  { key: "users", href: "/admin", label: "users" },
  { key: "titles", href: "/admin/novels", label: "titles" },
  { key: "authors", href: "/admin/authors", label: "authors" },
  { key: "submissions", href: "/admin/submissions", label: "submissions" },
];

export default function AdminSections({
  active,
  right,
}: {
  active: AdminSection;
  /** Right-hand action — defaults to the add-title link. */
  right?: ReactNode;
}) {
  const [pending, setPending] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/submissions?scope=count")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data && typeof data.pending === "number") setPending(data.pending);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-hairline px-4 py-2.5 font-mono text-[11px]">
      {SECTIONS.map((s) =>
        s.key === active ? (
          <span key={s.key} className="text-gold">
            {s.label}
            {s.key === "submissions" && pending ? <span className="tabular-nums"> · {pending}</span> : null}
          </span>
        ) : (
          <Link key={s.key} href={s.href} className="text-faint transition hover:text-muted">
            {s.label}
            {s.key === "submissions" && pending ? (
              <span className="text-gold-dim tabular-nums"> · {pending}</span>
            ) : null}
          </Link>
        )
      )}
      <span className="flex-1" />
      {right ?? (
        <Link href="/admin/novels/new" className="text-gold transition hover:text-gold-bright">
          [+ add title]
        </Link>
      )}
    </div>
  );
}
