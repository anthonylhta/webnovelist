// app/novel/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BookOpen, User, Layers, Globe, Calendar, Clock } from "lucide-react";
import AddToListButton from "@/components/AddToListButton";

export default async function NovelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const novel = await prisma.novel.findUnique({
    where: { id: parseInt(id) },
  });

  if (!novel) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Cover Image */}
        <div className="w-64 shrink-0 mx-auto md:mx-0">
          <img
            src={novel.coverImageUrl || "https://placehold.co/300x400/1a1a2e/ffffff?text=No+Cover"}
            alt={novel.title}
            className="w-full rounded-xl shadow-lg"
          />
          <AddToListButton
            novelId={novel.id}
            novelTitle={novel.title}
            totalChapters={novel.totalChapters}
          />
        </div>

        {/* Novel Info */}
        <div className="flex-1">
          <h1 className="text-4xl font-bold">{novel.title}</h1>
          {novel.titleChinese && (
            <h2 className="text-xl text-gray-400 mt-1">{novel.titleChinese}</h2>
          )}

          <div className="grid grid-cols-2 gap-4 mt-6">
            <InfoItem icon={<User className="w-4 h-4" />} label="Author" value={novel.author} />
            <InfoItem icon={<Layers className="w-4 h-4" />} label="Chapters" value={novel.totalChapters?.toString()} />
            <InfoItem icon={<Clock className="w-4 h-4" />} label="Status" value={novel.status} />
            <InfoItem icon={<Globe className="w-4 h-4" />} label="Source" value={novel.originalSource} />
            <InfoItem icon={<Calendar className="w-4 h-4" />} label="Year" value={novel.yearPublished?.toString()} />
          </div>

          <div className="flex flex-wrap gap-2 mt-6">
            {novel.genres.map((g) => (
              <span key={g} className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm">
                {g}
              </span>
            ))}
          </div>

          {novel.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {novel.tags.map((t) => (
                <span key={t} className="px-3 py-1 bg-gray-800 text-gray-400 rounded-full text-sm">
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              Description
            </h3>
            <p className="text-gray-300 leading-relaxed">
              {novel.description || "No description available."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-center gap-3 bg-gray-900 p-3 rounded-lg border border-gray-800">
      <div className="text-blue-500">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium">{value || "Unknown"}</p>
      </div>
    </div>
  );
}