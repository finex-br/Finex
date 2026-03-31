/**
 * Finex Design Tokens — Apple Design Language
 *
 * Single source of truth for spacing, shadows, animations, and
 * breakpoints used programmatically across the application.
 */

export const spacing = {
    /** Page padding on mobile */
    pageMobile: '1rem',
    /** Page padding on tablet */
    pageTablet: '1.5rem',
    /** Page padding on desktop */
    pageDesktop: '2rem',
    /** Gap between cards in grids */
    cardGap: '1.25rem',
    /** Internal card padding */
    cardPadding: '1.5rem',
    /** Section vertical spacing */
    sectionGap: '2rem',
} as const;

export const shadows = {
    /** Level 1: Subtle lift for cards */
    elevated:
        '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
    /** Level 1 hover */
    elevatedHover:
        '0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
    /** Level 2: Modals, popovers */
    prominent:
        '0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
} as const;

export const animation = {
    /** Micro-interactions (hover, toggle) */
    fast: '150ms',
    /** Standard transitions (open/close, navigate) */
    normal: '250ms',
    /** Emphasis transitions (modals, page enter) */
    slow: '400ms',
    /** Default easing */
    ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    /** Spring-like easing */
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

export const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1400,
} as const;

export const sidebar = {
    /** Width of the minimal side rail */
    railWidth: '64px',
    /** Expanded sidebar width (if needed) */
    expandedWidth: '240px',
} as const;

export const chartColors = {
    light: [
        'hsl(200, 100%, 20%)',   // Navy
        'hsl(168, 76%, 42%)',    // Teal
        'hsl(210, 68%, 52%)',    // Blue
        'hsl(36, 100%, 50%)',    // Amber
        'hsl(262, 52%, 52%)',    // Purple
    ],
    dark: [
        'hsl(168, 76%, 50%)',    // Teal
        'hsl(200, 80%, 60%)',    // Light Blue
        'hsl(210, 68%, 62%)',    // Blue
        'hsl(36, 100%, 58%)',    // Amber
        'hsl(262, 52%, 62%)',    // Purple
    ],
} as const;
