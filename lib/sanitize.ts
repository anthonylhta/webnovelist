// lib/sanitize.ts

// Remove HTML tags to prevent XSS
export function sanitizeString(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

// Check if input contains suspicious content
export function containsSuspiciousContent(input: string): boolean {
  const suspicious = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,         // onclick=, onerror=, etc.
    /eval\s*\(/i,
    /document\./i,
    /window\./i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /data:text\/html/i,
  ];
  return suspicious.some((pattern) => pattern.test(input));
}

// Sanitize an object's string values
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };

  for (const key in sanitized) {
    if (typeof sanitized[key] === "string") {
      sanitized[key] = sanitizeString(sanitized[key]) as any;
    }
  }

  return sanitized;
}

// Validate URL (only allow http/https)
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

// Validate image URL
export function isValidImageUrl(url: string): boolean {
  if (!isValidUrl(url)) return false;
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
  const lowerUrl = url.toLowerCase();
  return (
    lowerUrl.includes("cloudinary.com") ||
    lowerUrl.includes("placehold.co") ||
    imageExtensions.some((ext) => lowerUrl.includes(ext))
  );
}