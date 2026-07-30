// app/not-found.tsx
import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <BookOpen className="w-16 h-16 text-faint mb-6" />
      <h1 className="text-6xl font-serif font-bold text-paper mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-muted mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="bg-gold text-ink hover:bg-gold-bright px-6 py-3 rounded-lg font-semibold transition"
        >
          Go Home
        </Link>
        <Link
          href="/browse"
          className="bg-elevated hover:bg-hairline px-6 py-3 rounded-lg font-semibold transition"
        >
          Browse Library
        </Link>
      </div>
    </div>
  );
}