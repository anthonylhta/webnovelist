import { describe, it, expect } from "vitest";
import { parseAltTitles, MAX_ALT_TITLES } from "@/lib/alt-titles";

describe("parseAltTitles", () => {
  it("splits lines and semicolons, trims, drops blanks and case-insensitive dupes", () => {
    expect(parseAltTitles(" LOTM \n\nLord of Mysteries; lotm\r\nGuimi Zhi Zhu")).toEqual([
      "LOTM",
      "Lord of Mysteries",
      "Guimi Zhi Zhu",
    ]);
  });

  it("accepts an array too, and ignores non-strings", () => {
    expect(parseAltTitles(["ORV", 3, " Omniscient Reader "])).toEqual(["ORV", "Omniscient Reader"]);
    expect(parseAltTitles(undefined)).toEqual([]);
  });

  it("caps the count and each title's length", () => {
    const many = Array.from({ length: 30 }, (_, i) => `t${i}`);
    expect(parseAltTitles(many)).toHaveLength(MAX_ALT_TITLES);
    expect(parseAltTitles(["x".repeat(300)])[0]).toHaveLength(200);
  });
});
