// app/stats/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  BookMarked,
  BarChart3,
} from "lucide-react";

interface ListEntry {
  id: number;
  status: string;
  rating: number | null;
  currentChapter: number;
  dateStarted: string | null;
  dateFinished: string | null;
  novel: {
    id: number;
    title: string;
    totalChapters: number | null;
    genres: string[];
    author: string | null;
  };
}

export default function StatsPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<ListEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
      return;
    }

    if (isLoaded && isSignedIn) {
      fetch("/api/list")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setList(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-muted">Loading stats...</div>
      </div>
    );
  }

  // Calculate stats
  const totalNovels = list.length;
  const readingCount = list.filter((e) => e.status === "reading").length;
  const completedCount = list.filter((e) => e.status === "completed").length;
  const onHoldCount = list.filter((e) => e.status === "on_hold").length;
  const droppedCount = list.filter((e) => e.status === "dropped").length;
  const planToReadCount = list.filter((e) => e.status === "plan_to_read").length;

  const ratedNovels = list.filter((e) => e.rating !== null);
  const averageRating =
    ratedNovels.length > 0
      ? (ratedNovels.reduce((sum, e) => sum + (e.rating || 0), 0) / ratedNovels.length).toFixed(1)
      : "—";

  const totalChaptersRead = list.reduce((sum, e) => sum + e.currentChapter, 0);

  // Genre breakdown
  const genreCounts: Record<string, number> = {};
  list.forEach((entry) => {
    entry.novel.genres.forEach((genre) => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
  });
  const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
  const maxGenreCount = sortedGenres.length > 0 ? sortedGenres[0][1] : 0;

  // Author breakdown (top 5)
  const authorCounts: Record<string, number> = {};
  list.forEach((entry) => {
    if (entry.novel.author) {
      authorCounts[entry.novel.author] = (authorCounts[entry.novel.author] || 0) + 1;
    }
  });
  const topAuthors = Object.entries(authorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Rating distribution
  const ratingBuckets: Record<string, number> = {};
  for (let i = 1; i <= 10; i++) {
    ratingBuckets[i.toString()] = 0;
  }
  ratedNovels.forEach((entry) => {
    const bucket = Math.ceil(entry.rating || 0).toString();
    if (ratingBuckets[bucket] !== undefined) {
      ratingBuckets[bucket]++;
    }
  });
  const maxRatingCount = Math.max(...Object.values(ratingBuckets), 1);

  // Highest and lowest rated
  const sortedByRating = [...ratedNovels].sort(
    (a, b) => (b.rating || 0) - (a.rating || 0)
  );
  const highestRated = sortedByRating[0];
  const lowestRated = sortedByRating[sortedByRating.length - 1];

  if (totalNovels === 0) {
    return (
      <div className="text-center py-16">
        <BarChart3 className="w-16 h-16 text-faint mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2 font-serif text-paper">No Stats Yet</h1>
        <p className="text-muted mb-6">
          Add some novels to your list to see your reading statistics.
        </p>
        <a
          href="/browse"
          className="inline-block bg-gold text-ink hover:bg-gold-bright px-6 py-3 rounded-lg transition"
        >
          Browse Novels
        </a>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3 font-serif text-paper">
        <BarChart3 className="w-8 h-8 text-gold" />
        My Statistics
      </h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        <StatCard
          icon={<BookOpen className="w-5 h-5" />}
          label="Total"
          value={totalNovels.toString()}
          color="text-gold"
        />
        <StatCard
          icon={<BookMarked className="w-5 h-5" />}
          label="Reading"
          value={readingCount.toString()}
          color="text-gold"
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5" />}
          label="Completed"
          value={completedCount.toString()}
          color="text-jade"
        />
        <StatCard
          icon={<Pause className="w-5 h-5" />}
          label="On Hold"
          value={onHoldCount.toString()}
          color="text-muted"
        />
        <StatCard
          icon={<XCircle className="w-5 h-5" />}
          label="Dropped"
          value={droppedCount.toString()}
          color="text-seal-bright"
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Plan to Read"
          value={planToReadCount.toString()}
          color="text-gold-dim"
        />
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-surface border border-hairline rounded-xl p-6">
          <div className="flex items-center gap-2 text-gold mb-2">
            <Star className="w-5 h-5 fill-gold" />
            <span className="text-sm text-muted">Average Rating</span>
          </div>
          <div className="text-4xl font-bold">{averageRating}</div>
          <div className="text-sm text-faint mt-1">
            from {ratedNovels.length} rated novel{ratedNovels.length !== 1 ? "s" : ""}
          </div>
        </div>

        <div className="bg-surface border border-hairline rounded-xl p-6">
          <div className="flex items-center gap-2 text-gold mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm text-muted">Chapters Read</span>
          </div>
          <div className="text-4xl font-bold">{totalChaptersRead.toLocaleString()}</div>
          <div className="text-sm text-faint mt-1">across all novels</div>
        </div>

        <div className="bg-surface border border-hairline rounded-xl p-6">
          <div className="flex items-center gap-2 text-jade mb-2">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm text-muted">Completion Rate</span>
          </div>
          <div className="text-4xl font-bold">
            {totalNovels > 0
              ? Math.round((completedCount / totalNovels) * 100)
              : 0}
            %
          </div>
          <div className="text-sm text-faint mt-1">
            {completedCount} of {totalNovels} novels
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Rating Distribution */}
        <div className="bg-surface border border-hairline rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 font-serif text-paper">Rating Distribution</h2>
          {ratedNovels.length === 0 ? (
            <p className="text-faint">No rated novels yet.</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(ratingBuckets)
                .reverse()
                .map(([rating, count]) => (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="w-6 text-right text-sm text-muted">
                      {rating}
                    </span>
                    <Star className="w-3 h-3 text-gold fill-gold" />
                    <div className="flex-1 bg-elevated rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-gold/60 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(count / maxRatingCount) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="w-6 text-sm text-muted">{count}</span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Genre Breakdown */}
        <div className="bg-surface border border-hairline rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 font-serif text-paper">Genre Breakdown</h2>
          {sortedGenres.length === 0 ? (
            <p className="text-faint">No genre data yet.</p>
          ) : (
            <div className="space-y-3">
              {sortedGenres.map(([genre, count]) => (
                <div key={genre} className="flex items-center gap-3">
                  <span className="w-28 text-sm text-muted truncate">
                    {genre}
                  </span>
                  <div className="flex-1 bg-elevated rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-gold/60 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(count / maxGenreCount) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="w-6 text-sm text-muted">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Authors */}
        <div className="bg-surface border border-hairline rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 font-serif text-paper">Top Authors</h2>
          {topAuthors.length === 0 ? (
            <p className="text-faint">No author data yet.</p>
          ) : (
            <div className="space-y-3">
              {topAuthors.map(([author, count], index) => (
                <div
                  key={author}
                  className="flex items-center gap-3 bg-elevated/50 rounded-lg p-3"
                >
                  <span className="text-lg font-bold text-faint w-6">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium">{author}</div>
                    <div className="text-sm text-faint">
                      {count} novel{count !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Highlights */}
        <div className="bg-surface border border-hairline rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 font-serif text-paper">Highlights</h2>
          <div className="space-y-4">
            {highestRated && (
              <div className="bg-elevated/50 rounded-lg p-4">
                <div className="text-sm text-faint mb-1">⭐ Highest Rated</div>
                <div className="font-medium">{highestRated.novel.title}</div>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 text-gold fill-gold" />
                  <span className="text-gold">{highestRated.rating}</span>
                </div>
              </div>
            )}
            {lowestRated && ratedNovels.length > 1 && (
              <div className="bg-elevated/50 rounded-lg p-4">
                <div className="text-sm text-faint mb-1">📉 Lowest Rated</div>
                <div className="font-medium">{lowestRated.novel.title}</div>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 text-gold fill-gold" />
                  <span className="text-gold">{lowestRated.rating}</span>
                </div>
              </div>
            )}
            {list.reduce((max, e) =>
              e.currentChapter > (max?.currentChapter || 0) ? e : max,
              null as ListEntry | null
            ) && (
              <div className="bg-elevated/50 rounded-lg p-4">
                <div className="text-sm text-faint mb-1">📚 Most Chapters Read</div>
                <div className="font-medium">
                  {
                    list.reduce((max, e) =>
                      e.currentChapter > (max?.currentChapter || 0) ? e : max
                    ).novel.title
                  }
                </div>
                <div className="text-sm text-gold mt-1">
                  {
                    list.reduce((max, e) =>
                      e.currentChapter > (max?.currentChapter || 0) ? e : max
                    ).currentChapter
                  }{" "}
                  chapters
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-surface border border-hairline rounded-xl p-4 text-center">
      <div className={`flex justify-center mb-2 ${color}`}>{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-faint">{label}</div>
    </div>
  );
}