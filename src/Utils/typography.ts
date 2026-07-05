import {PixelRatio, TextStyle, Platform} from 'react-native';

const BASE_SIZES = {
  tabBarLabel: 9.5,
  badgeText: 9.5,
  smallCaption: 10.5,
  caption: 11.5,
  secondaryBody: 13.0,
  primaryBody: 14.0,
  inputText: 14.0,
  buttonText: 14.0,
  cardTitle: 15.5,
  sectionTitle: 17.5,
  screenTitle: 20.0,
  largeTitle: 23.0,
  displayHero: 26.0,
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

const fontFamilyHeader = Platform.select({
  ios: 'System',
  android: 'sans-serif-medium',
});

const fontFamilyBody = Platform.select({
  ios: 'System',
  android: 'sans-serif',
});

export const buildTypography = (): TypographyTokens => ({
  display: {
    fontFamily: fontFamilyHeader,
    fontSize: scaled(BASE_SIZES.displayHero),
    fontWeight: '700',
    lineHeight: Math.round(scaled(BASE_SIZES.displayHero) * 1.3),
    letterSpacing: -0.5,
  },
  h1: {
    fontFamily: fontFamilyHeader,
    fontSize: scaled(BASE_SIZES.largeTitle),
    fontWeight: '600',
    lineHeight: Math.round(scaled(BASE_SIZES.largeTitle) * 1.3),
    letterSpacing: -0.4,
  },
  h2: {
    fontFamily: fontFamilyHeader,
    fontSize: scaled(BASE_SIZES.screenTitle),
    fontWeight: '600',
    lineHeight: Math.round(scaled(BASE_SIZES.screenTitle) * 1.3),
    letterSpacing: -0.3,
  },
  h3: {
    fontFamily: fontFamilyHeader,
    fontSize: scaled(BASE_SIZES.sectionTitle),
    fontWeight: '600',
    lineHeight: Math.round(scaled(BASE_SIZES.sectionTitle) * 1.3),
    letterSpacing: 0,
  },
  h4: {
    fontFamily: fontFamilyHeader,
    fontSize: scaled(BASE_SIZES.cardTitle),
    fontWeight: '600',
    lineHeight: Math.round(scaled(BASE_SIZES.cardTitle) * 1.3),
    letterSpacing: 0,
  },
  bodyLarge: {
    fontFamily: fontFamilyBody,
    fontSize: scaled(BASE_SIZES.primaryBody),
    fontWeight: '400',
    lineHeight: Math.round(scaled(BASE_SIZES.primaryBody) * 1.5),
    letterSpacing: 0,
  },
  bodyMedium: {
    fontFamily: fontFamilyBody,
    fontSize: scaled(BASE_SIZES.secondaryBody),
    fontWeight: '400',
    lineHeight: Math.round(scaled(BASE_SIZES.secondaryBody) * 1.5),
    letterSpacing: 0,
  },
  bodySmall: {
    fontFamily: fontFamilyBody,
    fontSize: scaled(BASE_SIZES.caption),
    fontWeight: '400',
    lineHeight: Math.round(scaled(BASE_SIZES.caption) * 1.5),
    letterSpacing: 0,
  },
  caption: {
    fontFamily: fontFamilyBody,
    fontSize: scaled(BASE_SIZES.smallCaption),
    fontWeight: '400',
    lineHeight: Math.round(scaled(BASE_SIZES.smallCaption) * 1.5),
    letterSpacing: 0,
  },
  overline: {
    fontFamily: fontFamilyHeader,
    fontSize: scaled(BASE_SIZES.badgeText),
    fontWeight: '500',
    lineHeight: Math.round(scaled(BASE_SIZES.badgeText) * 1.5),
    letterSpacing: 0,
  },
  label: {
    fontFamily: fontFamilyBody,
    fontSize: scaled(BASE_SIZES.tabBarLabel),
    fontWeight: '500',
    lineHeight: Math.round(scaled(BASE_SIZES.tabBarLabel) * 1.5),
    letterSpacing: 0,
  },
  button: {
    fontFamily: fontFamilyHeader,
    fontSize: scaled(BASE_SIZES.buttonText),
    fontWeight: '600',
    lineHeight: Math.round(scaled(BASE_SIZES.buttonText) * 1.3),
    letterSpacing: 0,
  },
  code: {
    fontSize: scaled(BASE_SIZES.smallCaption),
    fontWeight: '400',
    lineHeight: Math.round(scaled(BASE_SIZES.smallCaption) * 1.5),
    letterSpacing: 0,
    fontFamily: Platform.select({ios: 'Courier New', android: 'monospace'}),
  },
});

export const typography = buildTypography();
