// Library export — the reader's list as portable rows, and CSV rendering.

export type ExportRow = {
  title: string;
  native_title: string | null;
  media_type: string;
  status: string;
  current_chapter: number;
  total_chapters: number | null;
  rating: number | null;
  date_started: string | null;
  date_finished: string | null;
  reread_count: number;
  reading_url: string | null;
  notes: string | null;
  mal_id: number | null;
  anilist_id: number | null;
  novel_id: number;
};

export const EXPORT_COLUMNS: (keyof ExportRow)[] = [
  "title", "native_title", "media_type", "status", "current_chapter", "total_chapters",
  "rating", "date_started", "date_finished", "reread_count", "reading_url", "notes",
  "mal_id", "anilist_id", "novel_id",
];

/** RFC 4180-ish: quote when needed, double embedded quotes, CRLF rows, UTF-8 BOM for Excel. */
export function toCsv(rows: ExportRow[]): string {
  const cell = (v: unknown): string => {
    if (v == null) return "";
    const s = String(v);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [EXPORT_COLUMNS.join(",")];
  for (const row of rows) lines.push(EXPORT_COLUMNS.map((c) => cell(row[c])).join(","));
  return "﻿" + lines.join("\r\n") + "\r\n";
}
