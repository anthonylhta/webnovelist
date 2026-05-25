import { describe, it, expect } from "vitest";
import { getBannerGradient, BANNER_OPTIONS } from "@/lib/banner-colors";

describe("getBannerGradient", () => {
  it("returns the correct gradient for a known color", () => {
    for (const option of BANNER_OPTIONS) {
      expect(getBannerGradient(option.name)).toBe(option.gradient);
    }
  });

  it("returns the default gradient for null", () => {
    expect(getBannerGradient(null)).toBe(BANNER_OPTIONS[0].gradient);
  });

  it("returns the default gradient for an unknown color name", () => {
    expect(getBannerGradient("nonexistent")).toBe(BANNER_OPTIONS[0].gradient);
  });

  it("default banner option is named 'default'", () => {
    expect(BANNER_OPTIONS[0].name).toBe("default");
  });
});
