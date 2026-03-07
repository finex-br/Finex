import { describe, it, expect } from '@jest/globals';
import { processEmbedHtml } from './sanitize-html';

describe('processEmbedHtml', () => {
    it('should return empty string for null/undefined/empty input', () => {
        expect(processEmbedHtml(null)).toBe('');
        expect(processEmbedHtml(undefined)).toBe('');
        expect(processEmbedHtml('')).toBe('');
        expect(processEmbedHtml('   ')).toBe('');
    });

    it('should trim whitespace from HTML', () => {
        const html = '  <div>content</div>  ';
        expect(processEmbedHtml(html)).toBe('<div>content</div>');
    });

    it('should accept any HTML content', () => {
        const html = '<html><head><style>body { color: red; }</style></head><body><h1>Dashboard</h1><table><tr><td>Data</td></tr></table></body></html>';
        expect(processEmbedHtml(html)).toBe(html);
    });

    it('should accept Power BI iframes', () => {
        const html = '<iframe src="https://app.powerbi.com/view?r=abc123" width="100%" height="600"></iframe>';
        expect(processEmbedHtml(html)).toBe(html);
    });

    it('should accept iframes from any origin', () => {
        const html = '<iframe src="https://example.com/embed" width="100%" height="600"></iframe>';
        expect(processEmbedHtml(html)).toBe(html);
    });

    it('should accept HTML with scripts (security handled at render time)', () => {
        const html = '<div><script>console.log("ok")</script><p>content</p></div>';
        expect(processEmbedHtml(html)).toBe(html);
    });

    it('should preserve complete HTML documents', () => {
        const html = `<!DOCTYPE html>
<html>
<head><title>Report</title></head>
<body><h1>My Report</h1></body>
</html>`;
        expect(processEmbedHtml(html)).toBe(html.trim());
    });
});
