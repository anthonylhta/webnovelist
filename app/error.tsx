"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <AlertTriangle className="w-12 h-12 text-seal-bright mb-4" />
      <h2 className="text-2xl font-serif font-bold text-paper mb-2">Something went wrong</h2>
      <p className="text-muted mb-8 max-w-md">
        An unexpected error occurred. Try again or go back to the home page.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 bg-gold text-ink hover:bg-gold-bright px-5 py-2.5 rounded-lg transition font-medium"
        >
          <RotateCcw className="w-4 h-4" />
          Try again
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 bg-elevated hover:bg-hairline px-5 py-2.5 rounded-lg transition font-medium"
        >
          <Home className="w-4 h-4" />
          Go home
        </Link>
      </div>
      {error.digest && (
        <p className="mt-6 text-xs text-faint">Error ID: {error.digest}</p>
      )}
    </div>
  );
}
