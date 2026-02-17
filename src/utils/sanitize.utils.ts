/**
 * @module SanitizeUtils
 * Security and sanitisation wrappers around bQuery's security primitives.
 */

import { escapeHtml, sanitize } from '@bquery/bquery/security';

/**
 * A safe set of HTML tags allowed in user-generated content.
 * Covers basic text formatting, links, lists, and code blocks.
 */
const SAFE_TAGS: string[] = [
  'b',
  'i',
  'em',
  'strong',
  'a',
  'p',
  'br',
  'ul',
  'ol',
  'li',
  'code',
  'pre',
];

/**
 * URL schemes considered safe for user-provided links.
 * Any URL whose scheme is not in this set will be rejected.
 */
const ALLOWED_URL_SCHEMES: ReadonlySet<string> = new Set([
  'http:',
  'https:',
  'mailto:',
]);

/**
 * Sanitise user-generated HTML using a safe tag allow-list.
 *
 * Permits basic formatting tags ({@link SAFE_TAGS}) while stripping
 * everything else (including scripts and event-handler attributes).
 *
 * @param html - Raw HTML string from the user.
 * @returns The sanitised HTML string.
 *
 * @example
 * ```ts
 * const clean = sanitizeUserContent('<p>Hello <script>alert(1)</script></p>');
 * // "<p>Hello </p>"
 * ```
 */
export function sanitizeUserContent(html: string): string {
  return sanitize(html, {
    allowTags: SAFE_TAGS,
    allowAttributes: ['href', 'target', 'rel'],
    allowDataAttributes: false,
  });
}

/**
 * Sanitise HTML by stripping **all** tags, leaving only plain text.
 *
 * Useful when HTML content must be rendered as text-only (e.g. tooltips
 * or notification messages).
 *
 * @param html - Raw HTML string.
 * @returns A plain-text string with every HTML tag removed.
 *
 * @example
 * ```ts
 * sanitizeStrict("<b>bold</b>"); // "bold"
 * ```
 */
export function sanitizeStrict(html: string): string {
  return sanitize(html, { stripAllTags: true });
}

/**
 * Escape a plain-text string so it can be safely embedded in HTML.
 *
 * Converts characters such as `<`, `>`, `&`, `"` and `'` into their
 * HTML entity equivalents.
 *
 * @param text - The raw text to escape.
 * @returns The HTML-escaped string.
 *
 * @example
 * ```ts
 * escapeForDisplay('2 < 3 & 5 > 4'); // "2 &lt; 3 &amp; 5 &gt; 4"
 * ```
 */
export function escapeForDisplay(text: string): string {
  return escapeHtml(text);
}

/**
 * Validate and sanitise a URL string.
 *
 * Only URLs with an allowed scheme (`http:`, `https:`, `mailto:`) are
 * returned. All other schemes (e.g. `javascript:`, `data:`, `vbscript:`)
 * are rejected and an empty string is returned instead.
 *
 * @param url - The URL to validate.
 * @returns The original URL when safe, or an empty string when the scheme
 *          is not allowed.
 *
 * @example
 * ```ts
 * sanitizeUrl("https://example.com");        // "https://example.com"
 * sanitizeUrl("javascript:alert(1)");        // ""
 * sanitizeUrl("data:text/html,<h1>Hi</h1>"); // ""
 * ```
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);

    if (!ALLOWED_URL_SCHEMES.has(parsed.protocol)) {
      return '';
    }

    return url;
  } catch {
    // Relative URLs or malformed strings — reject to be safe.
    return '';
  }
}
