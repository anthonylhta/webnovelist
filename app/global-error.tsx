"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
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
    <html lang="en">
      <body className="bg-ink text-body min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <AlertTriangle className="w-12 h-12 text-seal-bright mb-4 mx-auto" />
          <h2 className="text-2xl font-serif font-bold text-paper mb-2">Something went wrong</h2>
          <p className="text-muted mb-8">A critical error occurred. Please try again.</p>
          <button
            onClick={reset}
            className="flex items-center gap-2 bg-gold text-ink hover:bg-gold-bright px-5 py-2.5 rounded-lg transition font-medium mx-auto"
          >
            <RotateCcw className="w-4 h-4" />
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
