"use client";

import { useEffect, useRef } from "react";

// The catalog search field. `/` focuses it from anywhere on the page (the
// FolioNav hotkey routes other pages here with #search, which also focuses).
export default function SearchBox({ defaultValue }: { defaultValue: string }) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (window.location.hash === "#search") ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      e.preventDefault();
      ref.current?.focus();
      ref.current?.select();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <input
      ref={ref}
      type="text"
      name="search"
      defaultValue={defaultValue}
      placeholder="title, author… (press / to search)"
      autoComplete="off"
      className="w-full bg-transparent font-mono text-[12px] text-paper placeholder-faint focus:outline-none"
    />
  );
}
