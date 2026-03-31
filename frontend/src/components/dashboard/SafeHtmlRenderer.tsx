import React from 'react';

interface SafeHtmlRendererProps {
    html: string;
    className?: string;
}

/**
 * Renders HTML content safely inside a sandboxed iframe.
 *
 * Uses srcdoc to render the full HTML document in an isolated context.
 * The sandbox attribute with no permissions ensures maximum security —
 * the embedded content cannot access the parent page, run scripts,
 * or navigate away.
 */
export function SafeHtmlRenderer({
    html,
    className,
}: SafeHtmlRendererProps): React.ReactElement | null {
    if (!html || html.trim().length === 0) return null;

    return (
        <iframe
            srcDoc={html}
            sandbox=""
            className={className}
            style={{ width: '100%', minHeight: 600, border: 'none' }}
            title="Dashboard embed"
        />
    );
}
