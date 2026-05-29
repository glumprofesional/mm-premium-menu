// src/lib/webauthn.ts
// WebAuthn helper utilities

/**
 * Convert binary data to base64url string for database storage.
 * Handles both Uint8Array (v9) and string (v10+) return types from @simplewebauthn/server.
 */
export function toBase64url(data: Uint8Array | ArrayBuffer | string): string {
  if (typeof data === 'string') return data;
  const bytes = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
  return Buffer.from(bytes).toString('base64url');
}

/**
 * Convert base64url string from database to Uint8Array for verification.
 * Returns Uint8Array for strict TypeScript compatibility with @simplewebauthn/server.
 */
export function fromBase64url(base64url: string): Uint8Array {
  const buf = Buffer.from(base64url, 'base64url');
  return new Uint8Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

/**
 * Returns the Relying Party ID from a host string.
 */
export function getRPID(host: string): string {
  return host.split(':')[0];
}

/**
 * Returns the origin URL from a host string.
 */
export function getOrigin(host: string): string {
  const protocol = host.startsWith('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}

/**
 * Derives host from request headers (works on Vercel and local dev).
 */
export function getHost(headers: Headers): string {
  const forwardedHost = headers.get("x-forwarded-host")
  const host = forwardedHost || headers.get("host") || "localhost:3000"
  return host
}
