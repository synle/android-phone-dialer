/**
 * Design tokens for the dialer app.
 * Centralized here so the entire UI can be reskinned from one file.
 */

export const Colors = {
  // Primary palette
  primary: '#1A73E8',
  primaryDark: '#1557B0',
  primaryLight: '#4A90D9',

  // Semantic
  callGreen: '#34A853',
  callRed: '#EA4335',
  missed: '#EA4335',
  incoming: '#34A853',
  outgoing: '#1A73E8',

  // Neutrals
  background: '#FFFFFF',
  surface: '#F8F9FA',
  surfaceVariant: '#E8EAED',
  textPrimary: '#202124',
  textSecondary: '#5F6368',
  textTertiary: '#9AA0A6',
  border: '#DADCE0',
  divider: '#E8EAED',

  // Dark mode variants (for future use)
  darkBackground: '#121212',
  darkSurface: '#1E1E1E',
  darkTextPrimary: '#E8EAED',
  darkTextSecondary: '#9AA0A6',
} as const;

export const Typography = {
  dialpadNumber: {
    fontSize: 32,
    fontWeight: '300' as const,
    letterSpacing: 2,
    color: Colors.textPrimary,
  },
  dialpadKey: {
    fontSize: 28,
    fontWeight: '300' as const,
    color: Colors.textPrimary,
  },
  dialpadLetters: {
    fontSize: 10,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
    letterSpacing: 2,
  },
  heading: {
    fontSize: 20,
    fontWeight: '500' as const,
    color: Colors.textPrimary,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: Colors.textPrimary,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: Colors.textTertiary,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 16,
  full: 999,
} as const;
