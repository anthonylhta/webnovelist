// lib/media-types.ts
// Canonical list of media types — single source of truth for API validation,
// form dropdowns, card badges, and the browse filter.
export const MEDIA_TYPES = [
  "webnovel",
  "light_novel",
  "novel",
  "manga",
  "manhwa",
  "manhua",
] as const;

export type MediaType = (typeof MEDIA_TYPES)[number];

export const MEDIA_TYPE_LABELS: Record<MediaType, string> = {
  webnovel: "Webnovel",
  light_novel: "Light Novel",
  novel: "Novel",
  manga: "Manga",
  manhwa: "Manhwa",
  manhua: "Manhua",
};

export function isMediaType(value: unknown): value is MediaType {
  return typeof value === "string" && (MEDIA_TYPES as readonly string[]).includes(value);
}

// The DB column is an unvalidated string, so fall back to the raw value
export function mediaTypeLabel(value: string): string {
  return isMediaType(value) ? MEDIA_TYPE_LABELS[value] : value;
}
