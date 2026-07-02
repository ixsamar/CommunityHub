/**
 * CommunityHub Design Token — Spacing & Layout System
 *
 * A consistent 4-point grid with semantic border radius, icon size, and
 * elevation shadow levels for both iOS and Android.
 */

// ----------------------------------------------------------------------------
// 4-point base grid
// ----------------------------------------------------------------------------
export const spacing = {
  px: 1,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  section: 64,
} as const;

// ----------------------------------------------------------------------------
// Border radius scale
// ----------------------------------------------------------------------------
export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  xxl: 28,
  full: 9999,
} as const;

// ----------------------------------------------------------------------------
// Icon size scale
// ----------------------------------------------------------------------------
export const iconSize = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// ----------------------------------------------------------------------------
// Elevation system
// Provides consistent shadows that adapt per platform.
// On Android use elevation; on iOS use shadow* props.
// ----------------------------------------------------------------------------
export interface ElevationStyle {
  shadowColor: string;
  shadowOffset: {width: number; height: number};
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export const elevation = (shadowColor: string): Record<string, ElevationStyle> => ({
  none: {
    shadowColor,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor,
    shadowOffset: {width: 0, height: 16},
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 16,
  },
});
