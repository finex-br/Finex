/**
 * HTML processor for embed content.
 *
 * The HTML is stored as-is. Security is handled on the frontend
 * by rendering inside a sandboxed iframe (srcdoc).
 */

/**
 * Processes HTML embed content for storage.
 * Performs basic cleanup (trim) and returns the content.
 * Security is enforced at render time via iframe sandbox.
 */
export function processEmbedHtml(html: string | undefined | null): string {
    if (!html || typeof html !== 'string') return '';
    return html.trim();
}
