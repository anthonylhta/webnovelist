"use client";

import { useEffect } from "react";
import Link from "next/link";
import { FolioSheet } from "@/components/FolioKit";

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
    <FolioSheet statusLeft="webnovelist · error" footer="ink & gold">
      <div className="px-4 py-16 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-seal-bright">
          something went wrong
        </p>
        <p className="mx-auto mt-4 max-w-sm font-serif text-[15px] leading-relaxed text-body">
          An unexpected error occurred. Try again, or head back to the front
          page.
        </p>
        <p className="mt-6 flex items-center justify-center gap-5 font-mono text-[12px]">
          <button
            onClick={reset}
            className="text-gold transition hover:text-gold-bright"
          >
            [try again]
          </button>
          <Link href="/" className="text-muted transition hover:text-gold">
            [home]
          </Link>
        </p>
        {error.digest && (
          <p className="mt-8 font-mono text-[9.5px] text-faint">
            error id: {error.digest}
          </p>
        )}
      </div>
    </FolioSheet>
  );
}
