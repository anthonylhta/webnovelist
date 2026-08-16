import { describe, it, expect } from "vitest";
import { parseSubmission } from "@/lib/submissions";

describe("parseSubmission", () => {
  it("requires a title and defaults the media type", () => {
    expect(parseSubmission({})).toEqual({ error: "Title is required" });
    expect(parseSubmission({ title: "   " })).toEqual({ error: "Title is required" });
    const ok = parseSubmission({ title: "  Cradle " });
    expect(ok).toEqual({
      data: { title: "Cradle", nativeTitle: null, mediaType: "webnovel", author: null, sourceUrl: null, description: null, note: null },
    });
  });

  it("rejects bad media types, junk urls, oversize and suspicious input", () => {
    expect(parseSubmission({ title: "X", mediaType: "podcast" })).toEqual({ error: "Invalid media type" });
    expect(parseSubmission({ title: "X", sourceUrl: "not a url" })).toEqual({ error: "Source URL is not a valid link" });
    expect(parseSubmission({ title: "x".repeat(501) })).toEqual({ error: "Title is too long" });
    expect(parseSubmission({ title: "X", note: "n".repeat(1001) })).toEqual({ error: "A field is too long" });
    expect(parseSubmission({ title: "X", author: "<script>alert(1)</script>" })).toEqual({
      error: "Input contains invalid characters",
    });
  });

  it("keeps optional fields, treating empty strings as absent", () => {
    const res = parseSubmission({
      title: "Omniscient Reader",
      nativeTitle: "전지적 독자 시점",
      mediaType: "manhwa",
      author: "",
      sourceUrl: "https://example.com/orv",
      note: "please add",
    });
    expect(res).toEqual({
      data: {
        title: "Omniscient Reader",
        nativeTitle: "전지적 독자 시점",
        mediaType: "manhwa",
        author: null,
        sourceUrl: "https://example.com/orv",
        description: null,
        note: "please add",
      },
    });
  });
});
