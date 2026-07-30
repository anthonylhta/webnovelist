import { describe, it, expect } from "vitest";
import { safeImageSrc, ALLOWED_IMAGE_HOSTS } from "@/lib/image-hosts";

const FALLBACK = "/default-cover.svg";

describe("safeImageSrc", () => {
  it("returns the fallback for null/undefined/empty", () => {
    expect(safeImageSrc(null, FALLBACK)).toBe(FALLBACK);
    expect(safeImageSrc(undefined, FALLBACK)).toBe(FALLBACK);
    expect(safeImageSrc("", FALLBACK)).toBe(FALLBACK);
  });

  it("passes through local/relative paths unchanged", () => {
    expect(safeImageSrc("/default-avatar.svg", FALLBACK)).toBe("/default-avatar.svg");
    expect(safeImageSrc("/uploads/x.png", FALLBACK)).toBe("/uploads/x.png");
  });

  it("passes through URLs on allowed hosts", () => {
    const cloudinary =
      "https://res.cloudinary.com/dwdpy0tfw/image/upload/v1/novel-covers/x.jpg";
    const clerk = "https://img.clerk.com/abc.png";
    expect(safeImageSrc(cloudinary, FALLBACK)).toBe(cloudinary);
    expect(safeImageSrc(clerk, FALLBACK)).toBe(clerk);
  });

  it("falls back for URLs on non-whitelisted hosts", () => {
    // The real-world bug: an external cover next/image refuses to render.
    expect(
      safeImageSrc("https://readomni.com/i/abc/public", FALLBACK)
    ).toBe(FALLBACK);
    expect(
      safeImageSrc("https://m.media-amazon.com/images/x.jpg", FALLBACK)
    ).toBe(FALLBACK);
  });

  it("falls back for unparseable URLs", () => {
    expect(safeImageSrc("not a url", FALLBACK)).toBe(FALLBACK);
    expect(safeImageSrc("http://", FALLBACK)).toBe(FALLBACK);
  });

  it("does not match a host that merely contains an allowed host as a substring", () => {
    expect(
      safeImageSrc("https://res.cloudinary.com.evil.test/x.jpg", FALLBACK)
    ).toBe(FALLBACK);
  });

  it("keeps the allowed-host list in sync with what render code expects", () => {
    expect(ALLOWED_IMAGE_HOSTS).toContain("res.cloudinary.com");
    expect(ALLOWED_IMAGE_HOSTS).toContain("s4.anilist.co");
    expect(ALLOWED_IMAGE_HOSTS).toContain("img.clerk.com");
  });
});
