import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set.');
}

/**
 * Parameterized Neon SQL client.
 */
export const sql = neon(process.env.DATABASE_URL);

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
 * Inspects binary magic bytes to detect the true file format and block spoofed extensions.
 */
function detectFileSignature(
  buf: Buffer
): { mime: string; ext: string } | null {
  if (buf.length < 4) return null;

  // 1. PNG: 89 50 4E 47 0D 0A 1A 0A
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

  // 2. JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { mime: 'image/jpeg', ext: '.jpg' };
  }

  // 3. GIF: "GIF87a" or "GIF89a"
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

  // 4. WEBP: "RIFF" + 4 bytes + "WEBP"
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

  // 5. PDF: "%PDF-" (25 50 44 46 2D)
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

  // 6. DOC (OLE2 Compound Document): D0 CF 11 E0 A1 B1 1A E1
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

  // 7. DOCX (PK ZIP archive): 50 4B 03 04
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

  // 8. RTF: "{\rtf" (7B 5C 72 74 66)
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
 * and sanitizing the filename to prevent path traversal and double-extension attacks.
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
  // Reject oversized Base64 strings before allocating Buffer memory
  if (base64DataUri.length > Math.ceil(maxBytes * 1.37) + 256) {
    return {
      valid: false,
      error: `File size exceeds maximum limit of ${
        category === 'kyc' ? '4 MB' : '2 MB'
      }.`,
    };
  }

  const matches = base64DataUri.match(/^data:([^;]+);base64,([a-zA-Z0-9+/=\s]+)$/);
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

  // Sanitize filename: strip directory paths, extensions, and special characters
  const rawName = typeof rawFileName === 'string' ? rawFileName : category;
  const baseName = rawName
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