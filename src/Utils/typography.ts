import {PixelRatio, TextStyle} from 'react-native';

const BASE_SIZES = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 38,
} as const;

export const fontWeights: Record<string, TextStyle['fontWeight']> = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

const scale = (): number => Math.min(PixelRatio.getFontScale(), 1.4);

const scaled = (base: number): number => Math.round(base * scale());

export interface TypographyTokens {
  display: TextStyle;
  h1: TextStyle;
  h2: TextStyle;
  h3: TextStyle;
  h4: TextStyle;
  bodyLarge: TextStyle;
  bodyMedium: TextStyle;
  bodySmall: TextStyle;
  caption: TextStyle;
  overline: TextStyle;
  label: TextStyle;
  button: TextStyle;
  code: TextStyle;
}

export const buildTypography = (): TypographyTokens => ({
  display: {
    fontSize: scaled(BASE_SIZES.display),
    fontWeight: fontWeights.extrabold,
    lineHeight: scaled(BASE_SIZES.display) * 1.2,
    letterSpacing: -0.8,
  },
  h1: {
    fontSize: scaled(BASE_SIZES.xxxl),
    fontWeight: fontWeights.bold,
    lineHeight: scaled(BASE_SIZES.xxxl) * 1.25,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: scaled(BASE_SIZES.xxl),
    fontWeight: fontWeights.bold,
    lineHeight: scaled(BASE_SIZES.xxl) * 1.3,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: scaled(BASE_SIZES.xl),
    fontWeight: fontWeights.semibold,
    lineHeight: scaled(BASE_SIZES.xl) * 1.35,
    letterSpacing: -0.2,
  },
  h4: {
    fontSize: scaled(BASE_SIZES.lg),
    fontWeight: fontWeights.semibold,
    lineHeight: scaled(BASE_SIZES.lg) * 1.4,
    letterSpacing: -0.1,
  },
  bodyLarge: {
    fontSize: scaled(BASE_SIZES.lg),
    fontWeight: fontWeights.regular,
    lineHeight: scaled(BASE_SIZES.lg) * 1.55,
    letterSpacing: 0,
  },
  bodyMedium: {
    fontSize: scaled(BASE_SIZES.md),
    fontWeight: fontWeights.regular,
    lineHeight: scaled(BASE_SIZES.md) * 1.55,
    letterSpacing: 0.1,
  },
  bodySmall: {
    fontSize: scaled(BASE_SIZES.sm),
    fontWeight: fontWeights.regular,
    lineHeight: scaled(BASE_SIZES.sm) * 1.5,
    letterSpacing: 0.1,
  },
  caption: {
    fontSize: scaled(BASE_SIZES.xs),
    fontWeight: fontWeights.medium,
    lineHeight: scaled(BASE_SIZES.xs) * 1.5,
    letterSpacing: 0.2,
  },
  overline: {
    fontSize: scaled(BASE_SIZES.xs),
    fontWeight: fontWeights.semibold,
    lineHeight: scaled(BASE_SIZES.xs) * 1.4,
    letterSpacing: 1.2,
  },
  label: {
    fontSize: scaled(BASE_SIZES.sm),
    fontWeight: fontWeights.medium,
    lineHeight: scaled(BASE_SIZES.sm) * 1.4,
    letterSpacing: 0.15,
  },
  button: {
    fontSize: scaled(BASE_SIZES.md),
    fontWeight: fontWeights.semibold,
    lineHeight: scaled(BASE_SIZES.md) * 1.25,
    letterSpacing: 0.2,
  },
  code: {
    fontSize: scaled(BASE_SIZES.sm),
    fontWeight: fontWeights.regular,
    lineHeight: scaled(BASE_SIZES.sm) * 1.6,
    letterSpacing: 0,

    fontFamily: 'Courier New',
  },
});

export const typography = buildTypography();
