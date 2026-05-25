import { describe, it, expect } from "vitest";
import {
  sanitizeString,
  containsSuspiciousContent,
  sanitizeObject,
  isValidUrl,
  isValidImageUrl,
} from "@/lib/sanitize";

describe("sanitizeString", () => {
  it("escapes angle brackets", () => {
    expect(sanitizeString("<script>")).toBe("&lt;script&gt;");
  });

  it("escapes double quotes", () => {
    expect(sanitizeString('"quoted"')).toBe("&quot;quoted&quot;");
  });

  it("escapes single quotes", () => {
    expect(sanitizeString("it's")).toBe("it&#x27;s");
  });

  it("trims surrounding whitespace", () => {
    expect(sanitizeString("  hello  ")).toBe("hello");
  });

  it("leaves clean strings unchanged", () => {
    expect(sanitizeString("Chapter 42")).toBe("Chapter 42");
  });
});

describe("containsSuspiciousContent", () => {
  it("detects script tags", () => {
    expect(containsSuspiciousContent("<script>alert(1)</script>")).toBe(true);
  });

  it("detects javascript: protocol", () => {
    expect(containsSuspiciousContent("javascript:void(0)")).toBe(true);
  });

  it("detects inline event handlers", () => {
    expect(containsSuspiciousContent("onclick=evil()")).toBe(true);
    expect(containsSuspiciousContent("onerror =bad()")).toBe(true);
  });

  it("detects eval", () => {
    expect(containsSuspiciousContent("eval(something)")).toBe(true);
  });

  it("detects iframe tags", () => {
    expect(containsSuspiciousContent("<iframe src=x>")).toBe(true);
  });

  it("detects data URIs", () => {
    expect(containsSuspiciousContent("data:text/html,<h1>x</h1>")).toBe(true);
  });

  it("allows clean content", () => {
    expect(containsSuspiciousContent("Hello, world!")).toBe(false);
    expect(containsSuspiciousContent("A great novel about adventure.")).toBe(false);
  });
});

describe("sanitizeObject", () => {
  it("sanitizes string values", () => {
    const result = sanitizeObject({ title: "<b>Novel</b>", count: 5 });
    expect(result.title).toBe("&lt;b&gt;Novel&lt;/b&gt;");
    expect(result.count).toBe(5);
  });

  it("does not mutate the original object", () => {
    const original = { title: "<b>test</b>" };
    sanitizeObject(original);
    expect(original.title).toBe("<b>test</b>");
  });

  it("leaves non-string values untouched", () => {
    const result = sanitizeObject({ rating: 8.5, finished: true, count: 100 });
    expect(result.rating).toBe(8.5);
    expect(result.finished).toBe(true);
    expect(result.count).toBe(100);
  });
});

describe("isValidUrl", () => {
  it("accepts https URLs", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
  });

  it("accepts http URLs", () => {
    expect(isValidUrl("http://example.com")).toBe(true);
  });

  it("rejects javascript: protocol", () => {
    expect(isValidUrl("javascript:void(0)")).toBe(false);
  });

  it("rejects ftp: protocol", () => {
    expect(isValidUrl("ftp://example.com")).toBe(false);
  });

  it("rejects plain strings", () => {
    expect(isValidUrl("not-a-url")).toBe(false);
  });
});

describe("isValidImageUrl", () => {
  it("accepts Cloudinary URLs", () => {
    expect(
      isValidImageUrl("https://res.cloudinary.com/demo/image/upload/sample.jpg")
    ).toBe(true);
  });

  it("accepts common image extensions", () => {
    expect(isValidImageUrl("https://example.com/cover.jpg")).toBe(true);
    expect(isValidImageUrl("https://example.com/cover.webp")).toBe(true);
    expect(isValidImageUrl("https://example.com/cover.png")).toBe(true);
    expect(isValidImageUrl("https://example.com/cover.gif")).toBe(true);
  });

  it("rejects non-image URLs", () => {
    expect(isValidImageUrl("https://example.com/page.html")).toBe(false);
  });

  it("rejects invalid base URLs", () => {
    expect(isValidImageUrl("not-a-url")).toBe(false);
  });
});
