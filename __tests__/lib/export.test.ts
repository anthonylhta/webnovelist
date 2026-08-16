import { describe, it, expect } from "vitest";
import { toCsv, EXPORT_COLUMNS, type ExportRow } from "@/lib/export";

const row: ExportRow = {
  title: 'Say "hi", world',
  native_title: "诡秘之主",
  media_type: "webnovel",
  status: "reading",
  current_chapter: 341,
  total_chapters: 1430,
  rating: 9.5,
  date_started: "2026-01-02",
  date_finished: null,
  reread_count: 0,
  reading_url: null,
  notes: "line one\nline two",
  mal_id: null,
  anilist_id: 86,
  novel_id: 2,
};

describe("toCsv", () => {
  it("writes a header, quotes what needs quoting, and leaves nulls empty", () => {
    const csv = toCsv([row]);
    const lines = csv.replace(/^﻿/, "").split("\r\n");
    expect(lines[0]).toBe(EXPORT_COLUMNS.join(","));
    expect(lines[1]).toBe(
      '"Say ""hi"", world",诡秘之主,webnovel,reading,341,1430,9.5,2026-01-02,,0,,"line one\nline two",,86,2'
    );
    expect(csv.startsWith("﻿")).toBe(true);
  });
});
