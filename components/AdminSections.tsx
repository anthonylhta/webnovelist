"use client";

import Link from "next/link";
import type { ReactNode } from "react";

// The mono section row shared by the curation sheets: users · titles ·
// authors · submissions, the active one in gold, and a page-specific action
// on the right.

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
  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-hairline px-4 py-2.5 font-mono text-[11px]">
      {SECTIONS.map((s) =>
        s.key === active ? (
          <span key={s.key} className="text-gold">
            {s.label}
          </span>
        ) : (
          <Link key={s.key} href={s.href} className="text-faint transition hover:text-muted">
            {s.label}
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
