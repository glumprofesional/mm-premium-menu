/**
 * WebAuthn Configuration & Helpers
 * M&M Multiespacio — Biometric Authentication
 */

export const RP_NAME = 'M&M Multiespacio';

/**
 * Get the Relying Party ID from the host header.
 * For localhost, returns 'localhost'.
 * For production, returns the domain name.
 */
export function getRPID(host: string): string {
  if (host.includes('localhost')) return 'localhost';
  return host;
}

/**
 * Get the expected origin from the host header.
 * For localhost, returns http://localhost:3000.
 * For production, returns https://<domain>.
 */
export function getOrigin(host: string): string {
  if (host.includes('localhost')) return 'http://localhost:3000';
  return `https://${host}`;
}

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
 * Returns Uint8Array<ArrayBuffer> for strict TypeScript compatibility with @simplewebauthn/server.
 */
export function fromBase64url(base64url: string): Uint8Array<ArrayBuffer> {
  const buf = Buffer.from(base64url, 'base64url');
  return new Uint8Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

/**
 * Check if WebAuthn is available in the browser.
 * Client-side only.
 */
export function isWebAuthnAvailable(): boolean {
  return typeof window !== 'undefined' && window.PublicKeyCredential !== undefined;
}
