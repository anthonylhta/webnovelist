"use client";

import { useEffect } from "react";

// Replaces the root layout when it crashes — no providers, fonts, or global
// CSS are guaranteed here, so everything stays inline and self-contained.
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
      <body
        style={{
          background: "#0d0d0b",
          color: "#c7c1b8",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            border: "1px solid #2a2519",
            maxWidth: "24rem",
          }}
        >
          <p
            style={{
              fontFamily: "Consolas, monospace",
              fontSize: "10px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#d9543f",
            }}
          >
            something went wrong
          </p>
          <p style={{ marginTop: "1rem", fontSize: "15px", lineHeight: 1.6 }}>
            A critical error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              fontFamily: "Consolas, monospace",
              fontSize: "12px",
              color: "#c9a84c",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            [try again]
          </button>
        </div>
      </body>
    </html>
  );
}
