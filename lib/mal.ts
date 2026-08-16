// MyAnimeList manga-list export (the XML from myanimelist.net/panel.php?go=export)
// → our list vocabulary. Pure functions; the import route does the DB work.

export interface MalEntry {
  malId: number;
  title: string;
  chapters: number | null;
  readChapters: number;
  score: number | null;
  status: string;
  startedAt: Date | null;
  finishedAt: Date | null;
  timesRead: number;
  comments: string | null;
}

/** Text of the first <tag>…</tag> in a block, CDATA unwrapped and entities decoded. */
function field(block: string, tag: string): string | null {
  const m = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  if (!m) return null;
  let v = m[1].trim();
  const cdata = v.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
  if (cdata) v = cdata[1].trim();
  return v
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function int(v: string | null): number {
  const n = v ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) ? n : 0;
}

/** "2021-03-05" → Date; MAL writes "0000-00-00" for unknown. */
export function dateFromMal(v: string | null): Date | null {
  if (!v) return null;
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m || m[1] === "0000" || m[2] === "00" || m[3] === "00") return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

/** MAL list status → ours. Unknown values land in plan_to_read rather than failing. */
export function listStatusFromMal(status: string | null): string {
  switch ((status ?? "").toLowerCase()) {
    case "reading": return "reading";
    case "completed": return "completed";
    case "on-hold": return "on_hold";
    case "dropped": return "dropped";
    default: return "plan_to_read";
  }
}

/** Parse the export. Entries without an id or title are skipped; duplicates by id collapse. */
export function parseMalXml(xml: string): MalEntry[] {
  const out: MalEntry[] = [];
  const seen = new Set<number>();
  for (const m of xml.matchAll(/<manga>([\s\S]*?)<\/manga>/g)) {
    const block = m[1];
    const malId = int(field(block, "manga_mangadb_id"));
    const title = field(block, "manga_title");
    if (!malId || !title || seen.has(malId)) continue;
    seen.add(malId);
    const chapters = int(field(block, "manga_chapters"));
    const score = int(field(block, "my_score"));
    const comments = field(block, "my_comments");
    out.push({
      malId,
      title,
      chapters: chapters > 0 ? chapters : null,
      readChapters: Math.max(0, int(field(block, "my_read_chapters"))),
      score: score > 0 ? score : null,
      status: listStatusFromMal(field(block, "my_status")),
      startedAt: dateFromMal(field(block, "my_start_date")),
      finishedAt: dateFromMal(field(block, "my_finish_date")),
      timesRead: Math.max(0, int(field(block, "my_times_read"))),
      comments: comments || null,
    });
  }
  return out;
}
