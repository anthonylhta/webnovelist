// components/CopyLinkButton.tsx
"use client";

import { useState } from "react";

export default function CopyLinkButton({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/user/${username}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const url = `${window.location.origin}/user/${username}`;
      prompt("Copy this link:", url);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`shrink-0 font-mono text-[11px] transition ${
        copied ? "text-jade" : "text-muted hover:text-gold"
      }`}
      title="Copy profile link"
    >
      {copied ? "[copied ✓]" : "[share]"}
    </button>
  );
}