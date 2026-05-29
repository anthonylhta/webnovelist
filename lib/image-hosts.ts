// Single source of truth for the remote hosts next/image is allowed to load.
// `next.config.ts` derives `images.remotePatterns` from this list, and
// `safeImageSrc` uses it at render time — so the two can never drift apart.
//
// A URL on any other host (e.g. an external cover from seed/import data) cannot
// be optimized by next/image and renders as a broken/blank image. `safeImageSrc`
// guards against that by falling back to a local SVG instead.
export const ALLOWED_IMAGE_HOSTS = [
  "res.cloudinary.com",
  "img.clerk.com",
] as const;

/**
 * Returns a safe `<Image>` src: the URL itself when it's a local path or sits on
 * an allowed remote host, otherwise the given local `fallback`.
 */
export function safeImageSrc(
  url: string | null | undefined,
  fallback: string
): string {
  if (!url) return fallback;
  if (url.startsWith("/")) return url; // local/relative asset
  try {
    const { hostname } = new URL(url);
    return (ALLOWED_IMAGE_HOSTS as readonly string[]).includes(hostname)
      ? url
      : fallback;
  } catch {
    return fallback; // not a parseable URL
  }
}
