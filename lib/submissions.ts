// Title submissions — statuses, limits, and the body validation shared by the
// API and its tests. Pure: no DB access here.
import { isMediaType } from "@/lib/media-types";
import { containsSuspiciousContent, isValidUrl, sanitizeString } from "@/lib/sanitize";

export const SUBMISSION_STATUSES = ["pending", "approved", "merged", "rejected"] as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  pending: "pending review",
  approved: "added to the catalog",
  merged: "already in the catalog",
  rejected: "not added",
};

/** How many unreviewed submissions one reader may have open at once. */
export const MAX_PENDING_PER_USER = 10;

export type SubmissionInput = {
  title: string;
  nativeTitle: string | null;
  mediaType: string;
  author: string | null;
  sourceUrl: string | null;
  description: string | null;
  note: string | null;
};

const LIMITS = { title: 500, nativeTitle: 500, author: 200, sourceUrl: 2000, description: 5000, note: 1000 };

function optionalText(value: unknown, max: number): string | null | { error: string } {
  if (value == null || value === "") return null;
  if (typeof value !== "string") return { error: "Invalid field" };
  if (value.length > max) return { error: "A field is too long" };
  if (containsSuspiciousContent(value)) return { error: "Input contains invalid characters" };
  return sanitizeString(value);
}

/** Validate + sanitize a submission body. Returns the row data or an error message. */
export function parseSubmission(body: unknown): { data: SubmissionInput } | { error: string } {
  if (typeof body !== "object" || body === null) return { error: "Invalid body" };
  const b = body as Record<string, unknown>;

  if (typeof b.title !== "string" || b.title.trim().length === 0) return { error: "Title is required" };
  if (b.title.length > LIMITS.title) return { error: "Title is too long" };
  if (containsSuspiciousContent(b.title)) return { error: "Input contains invalid characters" };

  const mediaType = b.mediaType ?? "webnovel";
  if (!isMediaType(mediaType)) return { error: "Invalid media type" };

  const fields = {
    nativeTitle: optionalText(b.nativeTitle, LIMITS.nativeTitle),
    author: optionalText(b.author, LIMITS.author),
    sourceUrl: optionalText(b.sourceUrl, LIMITS.sourceUrl),
    description: optionalText(b.description, LIMITS.description),
    note: optionalText(b.note, LIMITS.note),
  };
  for (const v of Object.values(fields)) {
    if (v !== null && typeof v === "object") return v;
  }
  const sourceUrl = fields.sourceUrl as string | null;
  if (sourceUrl && !isValidUrl(sourceUrl)) return { error: "Source URL is not a valid link" };

  return {
    data: {
      title: sanitizeString(b.title.trim()),
      nativeTitle: fields.nativeTitle as string | null,
      mediaType,
      author: fields.author as string | null,
      sourceUrl,
      description: fields.description as string | null,
      note: fields.note as string | null,
    },
  };
}
