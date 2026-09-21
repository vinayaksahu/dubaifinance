/**
 * Dubai Finance Input Sanitization & Anti-XSS Utility
 * Protects against Stored XSS, HTML injection, and malicious payloads.
 */

/**
 * Strips HTML tags, script blocks, dangerous attributes, and non-printable control characters.
 */
export function sanitizeText(input: unknown, maxLength?: number): string {
  if (input === null || input === undefined) return "";
  let str = String(input);

  // 1. Remove script, style, and iframe blocks with their contents
  str = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  str = str.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
  str = str.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");

  // 2. Remove all remaining HTML tags
  str = str.replace(/<\/?[^>]+(>|$)/gi, "");

  // 3. Remove dangerous protocols and event handlers
  str = str.replace(/javascript:/gi, "");
  str = str.replace(/data:/gi, "");
  str = str.replace(/vbscript:/gi, "");
  str = str.replace(/on\w+\s*=/gi, "");

  // 4. Remove dangerous zero-width & non-printable ASCII control characters (keep \r, \n, \t)
  str = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\u200B-\u200D\uFEFF]/g, "");

  // 5. Trim
  str = str.trim();

  // 6. Max length limit
  if (maxLength && maxLength > 0 && str.length > maxLength) {
    str = str.substring(0, maxLength);
  }

  return str;
}

/**
 * Sanitizes alphanumeric identifiers (e.g. custom IDs like DF000001, hashes, wallet addresses).
 */
export function sanitizeIdentifier(input: unknown, allowedExtraChars = "_-"): string {
  if (!input) return "";
  const str = String(input).trim();
  const escapedExtra = allowedExtraChars.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  const regex = new RegExp(`[^a-zA-Z0-9${escapedExtra}]`, "g");
  return str.replace(regex, "");
}

/**
 * Sanitizes an email address.
 */
export function sanitizeEmail(input: unknown): string {
  if (!input) return "";
  return String(input).trim().toLowerCase().replace(/[^a-z0-9@._+-]/g, "");
}

/**
 * Recursively sanitizes string values inside an object or array.
 */
export function sanitizePayload<T>(data: T): T {
  if (typeof data === "string") {
    return sanitizeText(data) as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizePayload(item)) as unknown as T;
  }
  if (data !== null && typeof data === "object") {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(data)) {
      cleaned[key] = sanitizePayload(value);
    }
    return cleaned as T;
  }
  return data;
}
