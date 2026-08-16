import { describe, it, expect } from "vitest";
import { parseMalXml, listStatusFromMal, dateFromMal } from "@/lib/mal";

const SAMPLE = `<?xml version="1.0" encoding="UTF-8" ?>
<myanimelist>
  <myinfo><user_name>reader</user_name><user_export_type>2</user_export_type></myinfo>
  <manga>
    <manga_mangadb_id>121496</manga_mangadb_id>
    <manga_title><![CDATA[Solo Leveling]]></manga_title>
    <manga_volumes>0</manga_volumes>
    <manga_chapters>200</manga_chapters>
    <my_read_chapters>179</my_read_chapters>
    <my_start_date>2021-03-05</my_start_date>
    <my_finish_date>0000-00-00</my_finish_date>
    <my_score>9</my_score>
    <my_status>Reading</my_status>
    <my_comments><![CDATA[Great art & pacing]]></my_comments>
    <my_times_read>1</my_times_read>
    <update_on_import>1</update_on_import>
  </manga>
  <manga>
    <manga_mangadb_id>0</manga_mangadb_id>
    <manga_title><![CDATA[Broken entry]]></manga_title>
  </manga>
  <manga>
    <manga_mangadb_id>77</manga_mangadb_id>
    <manga_title>Tom &amp; Jerry: The Manga</manga_title>
    <manga_chapters>0</manga_chapters>
    <my_read_chapters>0</my_read_chapters>
    <my_score>0</my_score>
    <my_status>Plan to Read</my_status>
    <my_start_date>0000-00-00</my_start_date>
    <my_finish_date>0000-00-00</my_finish_date>
    <my_comments><![CDATA[]]></my_comments>
    <my_times_read>0</my_times_read>
  </manga>
  <manga>
    <manga_mangadb_id>121496</manga_mangadb_id>
    <manga_title><![CDATA[Solo Leveling (dupe)]]></manga_title>
  </manga>
</myanimelist>`;

describe("parseMalXml", () => {
  it("reads entries, unwrapping CDATA and entities, and normalising blanks", () => {
    const entries = parseMalXml(SAMPLE);
    expect(entries).toHaveLength(2);
    expect(entries[0]).toEqual({
      malId: 121496,
      title: "Solo Leveling",
      chapters: 200,
      readChapters: 179,
      score: 9,
      status: "reading",
      startedAt: new Date(2021, 2, 5),
      finishedAt: null,
      timesRead: 1,
      comments: "Great art & pacing",
    });
    expect(entries[1]).toMatchObject({
      malId: 77,
      title: "Tom & Jerry: The Manga",
      chapters: null,
      score: null,
      status: "plan_to_read",
      comments: null,
    });
  });

  it("skips entries without an id and collapses duplicate ids", () => {
    const ids = parseMalXml(SAMPLE).map((e) => e.malId);
    expect(ids).toEqual([121496, 77]);
  });

  it("returns nothing for non-MAL input", () => {
    expect(parseMalXml("<html>not a list</html>")).toEqual([]);
  });
});

describe("listStatusFromMal / dateFromMal", () => {
  it("maps MAL statuses and defaults unknowns to plan_to_read", () => {
    expect(listStatusFromMal("On-Hold")).toBe("on_hold");
    expect(listStatusFromMal("Dropped")).toBe("dropped");
    expect(listStatusFromMal("Weird")).toBe("plan_to_read");
  });

  it("treats zeroed dates as unknown", () => {
    expect(dateFromMal("0000-00-00")).toBeNull();
    expect(dateFromMal("2020-00-12")).toBeNull();
    expect(dateFromMal("2020-01-12")).toEqual(new Date(2020, 0, 12));
  });
});
