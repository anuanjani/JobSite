import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set.');
}

/**
 * Parameterized Neon SQL client.
 */
export const sql = neon(process.env.DATABASE_URL);

const SESSION_SECRET =
  process.env.JWT_SECRET ||
  process.env.UPLOADTHING_SECRET ||
  'rolematch-enterprise-hmac-secret-key-2026';

/**
 * Cleans a string, strips null bytes/control characters, and neutralizes
 * inline <script> or event-handler payloads.
 */
export function safeString(value: unknown, maxLength = 500): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/\0/g, '')
    .replace(/<\s*\/?\s*script\b[^>]*>/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Validates that a URL is strictly http:// or https:// to prevent
 * javascript: or data: URI XSS in <a href="..."> tags.
 */
export function safeHttpUrl(value: unknown): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';

  if (/^(javascript|vbscript|data|file|blob):/i.test(trimmed)) {
    return '';
  }

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const parsed = new URL(withProtocol);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {}

  return '';
}

/**
 * Validates image sources for <img src="..."> so only http(s) URLs or
 * safe raster base64 data URLs (PNG, JPEG, WEBP, GIF) are permitted.
 */
export function safeImageSrc(value: unknown): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';

  if (
    /^data:image\/(png|jpeg|jpg|webp|gif);base64,[a-z0-9+/=]+$/i.test(trimmed)
  ) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {}

  return '';
}

/**
 * Strictly validates that an input is a positive integer ID.
 */
export function safePositiveInt(value: unknown): number | null {
  const num = typeof value === 'number' ? value : Number(String(value).trim());
  if (!Number.isInteger(num) || num <= 0 || num > 2147483647) {
    return null;
  }
  return num;
}

/**
 * Escapes SQL LIKE / ILIKE wildcard characters (%, _, \) in user search strings.
 */
export function escapeSqlLike(input: unknown): string {
  const str = safeString(input, 200);
  return str.replace(/[\\%_]/g, '\\$&');
}

/**
 * Validates an outbound URL to prevent SSRF by blocking private, loopback,
 * and link-local IP ranges.
 */
export function isSafeOutboundUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();

    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname === '0.0.0.0'
    ) {
      return false;
    }

    if (
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('169.254.') ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * #8 Password Security: Cryptographic scrypt password hashing with random 16-byte salt.
 */
export function hashPassword(plainPassword: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto
    .scryptSync(plainPassword, salt, 64)
    .toString('hex');
  return `scrypt$${salt}$${derivedKey}`;
}

/**
 * #8 Password Security: Verifies scrypt hash or legacy plaintext password.
 * Returns { valid, needsRehash } so legacy accounts auto-upgrade seamlessly.
 */
export function verifyPassword(
  plainPassword: string,
  storedPassword: string
): { valid: boolean; needsRehash: boolean } {
  if (!plainPassword || !storedPassword) {
    return { valid: false, needsRehash: false };
  }

  if (storedPassword.startsWith('scrypt$')) {
    const parts = storedPassword.split('$');
    if (parts.length !== 3) return { valid: false, needsRehash: false };
    const [, salt, originalHash] = parts;
    try {
      const derivedBuf = crypto.scryptSync(plainPassword, salt, 64);
      const originalBuf = Buffer.from(originalHash, 'hex');
      if (derivedBuf.length !== originalBuf.length) {
        return { valid: false, needsRehash: false };
      }
      const match = crypto.timingSafeEqual(derivedBuf, originalBuf);
      return { valid: match, needsRehash: false };
    } catch {
      return { valid: false, needsRehash: false };
    }
  }

  // Fallback for pre-existing plaintext rows in Neon DB -> auto-rehash on match
  const isMatch = plainPassword === storedPassword;
  return { valid: isMatch, needsRehash: isMatch };
}

/**
 * #12 & #14: Creates an HMAC-SHA256 signed session token for HttpOnly cookies.
 */
export function createSessionToken(payload: {
  id: number;
  email: string;
  role: string;
}): string {
  const data = {
    id: payload.id,
    email: payload.email.toLowerCase(),
    role: payload.role.toUpperCase(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  const encoded = Buffer.from(JSON.stringify(data)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${signature}`;
}

/**
 * Verifies an HMAC-SHA256 session token from cookies.
 */
export function verifySessionToken(token?: string | null): {
  id: number;
  email: string;
  role: string;
} | null {
  if (!token || !token.includes('.')) return null;
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;

  try {
    const expectedSig = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(encoded)
      .digest('base64url');
    if (signature !== expectedSig) return null;

    const parsed = JSON.parse(
      Buffer.from(encoded, 'base64url').toString('utf8')
    );
    if (!parsed || typeof parsed.exp !== 'number' || Date.now() > parsed.exp) {
      return null;
    }
    return {
      id: Number(parsed.id),
      email: String(parsed.email),
      role: String(parsed.role),
    };
  } catch {
    return null;
  }
}

/**
 * #19 Sensitive Data: Server-side email masking (an***j***@live.in).
 */
export function maskEmailServer(rawEmail: unknown): string {
  const email = safeString(rawEmail, 254);
  if (!email || !email.includes('@')) return 'Not provided';
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return 'Not provided';

  if (localPart.length >= 6) {
    const firstTwo = localPart.slice(0, 2);
    const midChar = localPart[Math.ceil(localPart.length / 2)];
    return `${firstTwo}***${midChar}***@${domain}`;
  }
  if (localPart.length > 2) {
    return `${localPart.slice(0, 2)}***@${domain}`;
  }
  return `${localPart.charAt(0)}***@${domain}`;
}

/**
 * #19 Sensitive Data: Server-side phone masking (+91-******1873).
 */
export function maskPhoneServer(rawPhone: unknown): string {
  const phone = safeString(rawPhone, 50);
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '+91-**********';
  return `+91-******${digits.slice(-4)}`;
}

/**
 * Enterprise Immutable Security Audit Logger.
 */
export async function logAuditEvent(params: {
  actorEmail: string;
  actorRole?: string;
  action: string;
  target?: string;
  details?: string;
}) {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        actor_email VARCHAR(255),
        actor_role VARCHAR(50),
        action VARCHAR(100) NOT NULL,
        target VARCHAR(255),
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      INSERT INTO audit_logs (actor_email, actor_role, action, target, details)
      VALUES (
        ${safeString(params.actorEmail, 254)},
        ${safeString(params.actorRole || 'USER', 50)},
        ${safeString(params.action, 100)},
        ${safeString(params.target || '', 254)},
        ${safeString(params.details || '', 1000)}
      )
    `;
  } catch (err) {
    console.error('Audit log error:', err);
  }
}

/**
 * Inspects binary magic bytes to detect the true file format and block spoofed extensions.
 */
function detectFileSignature(
  buf: Buffer
): { mime: string; ext: string } | null {
  if (buf.length < 4) return null;

  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return { mime: 'image/png', ext: '.png' };
  }

  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { mime: 'image/jpeg', ext: '.jpg' };
  }

  if (
    buf.length >= 6 &&
    buf[0] === 0x47 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x38 &&
    (buf[4] === 0x37 || buf[4] === 0x39) &&
    buf[5] === 0x61
  ) {
    return { mime: 'image/gif', ext: '.gif' };
  }

  if (
    buf.length >= 12 &&
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  ) {
    return { mime: 'image/webp', ext: '.webp' };
  }

  if (
    buf.length >= 5 &&
    buf[0] === 0x25 &&
    buf[1] === 0x50 &&
    buf[2] === 0x44 &&
    buf[3] === 0x46 &&
    buf[4] === 0x2d
  ) {
    return { mime: 'application/pdf', ext: '.pdf' };
  }

  if (
    buf.length >= 8 &&
    buf[0] === 0xd0 &&
    buf[1] === 0xcf &&
    buf[2] === 0x11 &&
    buf[3] === 0xe0 &&
    buf[4] === 0xa1 &&
    buf[5] === 0xb1 &&
    buf[6] === 0x1a &&
    buf[7] === 0xe1
  ) {
    return { mime: 'application/msword', ext: '.doc' };
  }

  if (
    buf[0] === 0x50 &&
    buf[1] === 0x4b &&
    buf[2] === 0x03 &&
    buf[3] === 0x04
  ) {
    return {
      mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ext: '.docx',
    };
  }

  if (
    buf.length >= 5 &&
    buf[0] === 0x7b &&
    buf[1] === 0x5c &&
    buf[2] === 0x72 &&
    buf[3] === 0x74 &&
    buf[4] === 0x66
  ) {
    return { mime: 'application/rtf', ext: '.rtf' };
  }

  return null;
}

/**
 * Validates Base64 file uploads by checking size limits, verifying binary magic bytes,
 * and sanitizing the filename.
 */
export function validateAndDecodeBase64File(
  base64DataUri: unknown,
  rawFileName: unknown,
  category: 'avatar' | 'resume' | 'kyc'
): {
  valid: boolean;
  error?: string;
  buffer?: Buffer;
  safeFileName?: string;
  mimeType?: string;
} {
  if (typeof base64DataUri !== 'string' || !base64DataUri.startsWith('data:')) {
    return { valid: false, error: 'Invalid file data format.' };
  }

  const maxBytes = category === 'kyc' ? 4 * 1024 * 1024 : 2 * 1024 * 1024;
  if (base64DataUri.length > Math.ceil(maxBytes * 1.37) + 256) {
    return {
      valid: false,
      error: `File size exceeds maximum limit of ${
        category === 'kyc' ? '4 MB' : '2 MB'
      }.`,
    };
  }

  const matches = base64DataUri.match(
    /^data:([^;]+);base64,([a-zA-Z0-9+/=\s]+)$/
  );
  if (!matches) {
    return { valid: false, error: 'Malformed Base64 file payload.' };
  }

  const buffer = Buffer.from(matches[2], 'base64');
  if (buffer.length === 0 || buffer.length > maxBytes) {
    return {
      valid: false,
      error: `File size must be between 1 byte and ${
        category === 'kyc' ? '4 MB' : '2 MB'
      }.`,
    };
  }

  const signature = detectFileSignature(buffer);
  if (!signature) {
    return {
      valid: false,
      error: 'Unsupported or unrecognized file signature.',
    };
  }

  const allowedAvatarMimes = new Set([
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
  ]);
  const allowedResumeMimes = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/rtf',
  ]);
  const allowedKycMimes = new Set([
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
  ]);

  if (category === 'avatar' && !allowedAvatarMimes.has(signature.mime)) {
    return {
      valid: false,
      error: 'Avatar must be a valid PNG, JPG, WEBP, or GIF image.',
    };
  }
  if (category === 'resume' && !allowedResumeMimes.has(signature.mime)) {
    return {
      valid: false,
      error: 'Resume must be a valid PDF, DOC, DOCX, or RTF document.',
    };
  }
  if (category === 'kyc' && !allowedKycMimes.has(signature.mime)) {
    return {
      valid: false,
      error: 'KYC document must be a valid PDF, PNG, JPG, or WEBP file.',
    };
  }

  const rawName = typeof rawFileName === 'string' ? rawFileName : category;
  const baseName =
    rawName
      .split(/[\\/]/)
      .pop()!
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 60) || category;

  const safeFileName = `${baseName}_${Date.now()}${signature.ext}`;

  return {
    valid: true,
    buffer,
    safeFileName,
    mimeType: signature.mime,
  };
}