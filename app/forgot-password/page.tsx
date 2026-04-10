// app/forgot-password/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStatus("sending");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setStatus("idle");
        return;
      }

      setStatus("sent");
    } catch {
      setError("Something went wrong");
      setStatus("idle");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
        {status === "sent" ? (
          <div className="text-center">
            <Mail className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Check Your Email</h1>
            <p className="text-gray-400 mb-6">
              If an account exists with that email, we&apos;ve sent a password reset link.
              Check your inbox and spam folder.
            </p>
            <Link
              href="/login"
              className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <Link
              href="/login"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-6 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>

            <h1 className="text-2xl font-bold mb-2">Forgot Password</h1>
            <p className="text-gray-400 text-sm mb-6">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg p-3 mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3
                             text-gray-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50
                           text-white font-semibold py-3 rounded-lg transition"
              >
                {status === "sending" ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}