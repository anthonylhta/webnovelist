// components/NovelCard.tsx
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { safeImageSrc } from "@/lib/image-hosts";

interface NovelCardProps {
  id: number;
  title: string;
  nativeTitle?: string | null;
  coverImageUrl?: string | null;
  /** Poster width. "md" = home strips (w-28 sm:w-36), "sm" = compact (w-20 sm:w-24). Ignored when `bordered`. */
  size?: "sm" | "md";
  /** Browse-style grid card: bordered container, cover full-bleed at top, content padded below. */
  bordered?: boolean;
  /** LCP hint for the first above-the-fold cover. */
  priority?: boolean;
  /** Optional metadata rendered under the title (author, tracking count, genres, status…). */
  footer?: ReactNode;
  /** Extra classes on the outer <Link> (e.g. width overrides in a grid). */
  className?: string;
}

const POSTER_SIZES = {
  md: { width: "shrink-0 w-28 sm:w-36", sizes: "(max-width: 640px) 112px, 144px", title: "text-sm" },
  sm: { width: "shrink-0 w-20 sm:w-24", sizes: "(max-width: 640px) 80px, 96px", title: "text-xs" },
} as const;

const BORDERED_SIZES = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px";

/**
 * Shared novel cover card. Two layouts:
 *  - poster (default): standalone framed cover with the title beneath — home strips, profile favourites.
 *  - bordered: a card whose border wraps a full-bleed cover plus a padded content block — the browse grid.
 * The `list` page intentionally does not use this (it's a horizontal row, not a poster).
 */
export default function NovelCard({
  id,
  title,
  nativeTitle,
  coverImageUrl,
  size = "md",
  bordered = false,
  priority = false,
  footer,
  className,
}: NovelCardProps) {
  const src = safeImageSrc(coverImageUrl, "/default-cover.svg");

  if (bordered) {
    return (
      <Link
        href={`/novel/${id}`}
        className={`group bg-surface rounded-lg border border-hairline overflow-hidden hover:border-gold-dim transition ${className ?? ""}`}
      >
        <div className="relative aspect-[3/4] bg-elevated overflow-hidden">
          <Image
            fill
            sizes={BORDERED_SIZES}
            src={src}
            alt={title}
            priority={priority}
            className="object-cover group-hover:scale-105 transition duration-300"
          />
        </div>
        <div className="p-4">
          <h3 className="font-serif text-paper truncate group-hover:text-gold transition">{title}</h3>
          {nativeTitle && (
            <p className="font-cjk text-muted text-sm truncate">{nativeTitle}</p>
          )}
          {footer}
        </div>
      </Link>
    );
  }

  const poster = POSTER_SIZES[size];
  return (
    <Link href={`/novel/${id}`} className={`group ${className ?? poster.width}`}>
      <div className="relative aspect-[3/4] bg-surface rounded-md overflow-hidden mb-2 ring-1 ring-hairline group-hover:ring-gold/50 transition">
        <Image
          fill
          sizes={poster.sizes}
          src={src}
          alt={title}
          priority={priority}
          className="object-cover group-hover:scale-105 transition duration-300"
        />
      </div>
      <h3 className={`font-serif ${poster.title} truncate text-paper group-hover:text-gold transition`}>
        {title}
      </h3>
      {nativeTitle && (
        <p className="font-cjk text-xs text-muted truncate">{nativeTitle}</p>
      )}
      {footer}
    </Link>
  );
}
