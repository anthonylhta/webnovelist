// components/CopyLinkButton.tsx
"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

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
      className="flex items-center gap-2 bg-elevated hover:bg-hairline px-4 py-2
                 rounded-lg transition text-sm text-muted hover:text-paper shrink-0"
      title="Copy profile link"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-jade" />
          <span className="text-jade">Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          Share
        </>
      )}
    </button>
  );
}