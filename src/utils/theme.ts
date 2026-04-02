// src/utils/theme.ts
export const Colors = {
  primary:        '#6C47FF',
  primaryLight:   '#EDE9FF',
  primaryDark:    '#4F2FE0',

  success:        '#16A34A',
  successLight:   '#DCFCE7',
  danger:         '#DC2626',
  dangerLight:    '#FEE2E2',
  warning:        '#D97706',
  warningLight:   '#FEF3C7',

  white:          '#FFFFFF',
  black:          '#111827',
  gray50:         '#F9FAFB',
  gray100:        '#F3F4F6',
  gray200:        '#E5E7EB',
  gray400:        '#9CA3AF',
  gray500:        '#6B7280',
  gray700:        '#374151',

  cardShadow:     '#6C47FF',
} as const;

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
} as const;

export const Radius = {
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  full: 9999,
} as const;

export const FontSize = {
  xs:   11,
  sm:   13,
  md:   15,
  base: 16,
  lg:   18,
  xl:   22,
  xxl:  26,
  xxxl: 32,
} as const;
