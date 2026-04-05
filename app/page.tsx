// app/page.tsx
import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <div className="text-6xl mb-6">📚</div>
      <h1 className="text-5xl font-bold mb-4">NovelTracker</h1>
      <p className="text-xl text-gray-400 mb-8 max-w-lg">
        Track your Webnovel reading journey. Rate, organize, and
        never lose your place again.
      </p>

      <div className="flex gap-4">
        <Link
          href="/browse"
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition"
        >
          Browse Novels
        </Link>
        <Link
          href="/list"
          className="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-lg font-semibold transition"
        >
          My List
        </Link>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full max-w-3xl">
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="text-4xl mb-3">📂</div>
          <h3 className="font-semibold mb-2">Organize</h3>
          <p className="text-gray-400 text-sm">
            Sort novels into reading, completed, dropped, and more.
          </p>
        </div>
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="text-4xl mb-3">⭐</div>
          <h3 className="font-semibold mb-2">Rate</h3>
          <p className="text-gray-400 text-sm">
            Rate novels out of 10 and keep personal notes.
          </p>
        </div>
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="text-4xl mb-3">📖</div>
          <h3 className="font-semibold mb-2">Track</h3>
          <p className="text-gray-400 text-sm">
            Track your chapter progress and reading dates.
          </p>
        </div>
      </div>
    </div>
  );
}