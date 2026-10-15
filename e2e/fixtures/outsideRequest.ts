const LOOPBACK = new Set(["localhost", "127.0.0.1"]);
const INLINE = new Set(["data:", "blob:"]);

export function isOutsideRequest(raw: string): boolean {
  const url = new URL(raw);
  return !LOOPBACK.has(url.hostname) && !INLINE.has(url.protocol);
}
