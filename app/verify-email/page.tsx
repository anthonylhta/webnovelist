// app/verify-email/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error" | "no-token">(
    token ? "loading" : "no-token"
  );
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">("idle");

  useEffect(() => {
    if (!token) return;

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setStatus("error");
          setMessage(data.error);
        } else {
          setStatus("success");
          setMessage(data.message);
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong");
      });
  }, [token]);

  const handleResend = async () => {
    if (!resendEmail) return;
    setResendStatus("sending");

    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail }),
      });
      setResendStatus("sent");
    } catch {
      setResendStatus("idle");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
            <h1 className="text-xl font-bold mb-2">Verifying Email...</h1>
            <p className="text-gray-400">Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Email Verified!</h1>
            <p className="text-gray-400 mb-6">{message}</p>
            <Link
              href="/login"
              className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition"
            >
              Login Now
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Verification Failed</h1>
            <p className="text-gray-400 mb-6">{message}</p>

            <div className="mt-6 pt-6 border-t border-gray-800">
              <p className="text-gray-400 text-sm mb-3">Need a new verification link?</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2
                             text-gray-100 text-sm focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleResend}
                  disabled={resendStatus !== "idle" || !resendEmail}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 
                             px-4 py-2 rounded-lg text-sm font-semibold transition"
                >
                  {resendStatus === "sending" ? "Sending..." : resendStatus === "sent" ? "Sent!" : "Resend"}
                </button>
              </div>
            </div>
          </>
        )}

        {status === "no-token" && (
          <>
            <Mail className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Check Your Email</h1>
            <p className="text-gray-400 mb-6">
              We sent a verification link to your email. Click the link to verify your account.
            </p>

            <div className="mt-6 pt-6 border-t border-gray-800">
              <p className="text-gray-400 text-sm mb-3">Didn&apos;t receive the email?</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2
                             text-gray-100 text-sm focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleResend}
                  disabled={resendStatus !== "idle" || !resendEmail}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 
                             px-4 py-2 rounded-lg text-sm font-semibold transition"
                >
                  {resendStatus === "sending" ? "Sending..." : resendStatus === "sent" ? "Sent!" : "Resend"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto mt-16">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <Loader2 className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}