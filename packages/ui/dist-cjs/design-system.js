"use strict";
// packages/ui/src/design-system.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.borderRadius = exports.shadows = exports.spacing = exports.typography = exports.colors = void 0;
exports.colors = {
    primary: '#6200EE',
    primaryVariant: '#3700B3',
    secondary: '#03DAC6',
    secondaryVariant: '#018786',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    error: '#B00020',
    onPrimary: '#FFFFFF',
    onSecondary: '#000000',
    onBackground: '#000000',
    onSurface: '#000000',
    onError: '#FFFFFF',
    // Flat UI Colors
    flatBlue: '#3498db',
    flatGreen: '#2ecc71',
    flatRed: '#e74c3c',
    flatYellow: '#f1c40f',
    flatGray: '#95a5a6',
};
exports.typography = {
    h1: {
        fontSize: '2.5rem',
        fontWeight: '700',
        lineHeight: '1.2',
    },
    h2: {
        fontSize: '2rem',
        fontWeight: '700',
        lineHeight: '1.2',
    },
    h3: {
        fontSize: '1.75rem',
        fontWeight: '700',
        lineHeight: '1.2',
    },
    body1: {
        fontSize: '1rem',
        fontWeight: '400',
        lineHeight: '1.5',
    },
    body2: {
        fontSize: '0.875rem',
        fontWeight: '400',
        lineHeight: '1.5',
    },
    caption: {
        fontSize: '0.75rem',
        fontWeight: '400',
        lineHeight: '1.5',
    },
};
exports.spacing = {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
};
exports.shadows = {
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    none: 'none',
};
exports.borderRadius = {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    full: '9999px',
};
//# sourceMappingURL=design-system.js.map