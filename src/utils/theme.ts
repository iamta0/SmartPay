export const Colors = {
  // ── Brand ────────────────────────────────────────────────────────────────
  primary:      '#1A1F36',        // deep navy
  primaryLight: '#E8EAFF',        // soft lavender tint
  primaryDark:  '#0D1021',        // darker navy

  // ── Accent ───────────────────────────────────────────────────────────────
  accent:       '#F5A623',        // gold
  accentLight:  '#FEF3DC',        // light gold tint
  accentDark:   '#C47F0A',        // deep gold

  // ── Semantic ──────────────────────────────────────────────────────────────
  success:      '#12B76A',
  successLight: '#D1FAE5',
  danger:       '#F04438',
  dangerLight:  '#FEE4E2',
  warning:      '#F79009',
  warningLight: '#FEF0C7',

  // ── Neutrals ──────────────────────────────────────────────────────────────
  white:        '#FFFFFF',
  black:        '#0A0A0A',
  background:   '#F4F5F9',        // cool off-white
  cardShadow:   '#1A1F36',

  gray100:      '#F2F4F7',
  gray200:      '#E4E7EC',
  gray300:      '#D0D5DD',
  gray400:      '#98A2B3',
  gray500:      '#667085',
  gray600:      '#475467',
  gray700:      '#344054',
  gray800:      '#1D2939',
  gray900:      '#101828',

  // ── Card & Surface ────────────────────────────────────────────────────────
  surface:      '#FFFFFF',
  surfaceAlt:   '#F8F9FC',
  border:       '#E4E7EC',
  overlay:      'rgba(0,0,0,0.45)',
};

export const FontSize = {
  xs:    11,
  sm:    13,
  base:  15,
  md:    16,
  lg:    18,
  xl:    22,
  xxl:   26,
  xxxl:  34,
  huge:  44,
};

export const Spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  xxl:  32,
  xxxl: 48,
};

export const Radius = {
  sm:   6,
  md:   10,
  lg:   14,
  xl:   20,
  xxl:  28,
  full: 999,
};

export const Shadow = {
  xs: {
    shadowColor:   '#101828',
    shadowOffset:  { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius:  2,
    elevation:     1,
  },
  card: {
    shadowColor:   '#101828',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius:  12,
    elevation:     3,
  },
  strong: {
    shadowColor:   '#101828',
    shadowOffset:  { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius:  24,
    elevation:     8,
  },
  colored: {
    shadowColor:   '#1A1F36',
    shadowOffset:  { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius:  16,
    elevation:     6,
  },
};

export const Typography = {
  heading1: { fontSize: FontSize.huge, fontWeight: '800' as const, letterSpacing: -0.5 },
  heading2: { fontSize: FontSize.xxxl, fontWeight: '700' as const, letterSpacing: -0.3 },
  heading3: { fontSize: FontSize.xxl,  fontWeight: '700' as const, letterSpacing: -0.2 },
  heading4: { fontSize: FontSize.xl,   fontWeight: '600' as const },
  body:     { fontSize: FontSize.base, fontWeight: '400' as const, lineHeight: 22 },
  bodyBold: { fontSize: FontSize.base, fontWeight: '600' as const },
  caption:  { fontSize: FontSize.sm,   fontWeight: '400' as const, lineHeight: 18 },
  label:    { fontSize: FontSize.xs,   fontWeight: '600' as const, letterSpacing: 0.5 },
};