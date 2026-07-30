import { describe, it, expect } from "vitest";
import { MEDIA_TYPES, isMediaType, mediaTypeLabel } from "@/lib/media-types";

describe("isMediaType", () => {
  it("accepts every canonical type", () => {
    for (const t of MEDIA_TYPES) expect(isMediaType(t)).toBe(true);
  });

  it("rejects unknown strings and non-strings", () => {
    expect(isMediaType("comic")).toBe(false);
    expect(isMediaType("Webnovel")).toBe(false);
    expect(isMediaType(null)).toBe(false);
    expect(isMediaType(undefined)).toBe(false);
    expect(isMediaType(3)).toBe(false);
  });
});

describe("mediaTypeLabel", () => {
  it("maps known types to display labels", () => {
    expect(mediaTypeLabel("webnovel")).toBe("Webnovel");
    expect(mediaTypeLabel("light_novel")).toBe("Light Novel");
    expect(mediaTypeLabel("manhwa")).toBe("Manhwa");
  });

  it("falls back to the raw value for unknown types", () => {
    expect(mediaTypeLabel("mystery_meat")).toBe("mystery_meat");
  });
});
