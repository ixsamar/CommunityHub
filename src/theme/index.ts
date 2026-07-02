/**
 * CommunityHub Theme Index
 *
 * Exports:
 * - lightTheme / darkTheme
 * - AppTheme type
 * - useTheme()      — full theme object
 * - useColors()     — only color tokens (minimal re-render surface)
 * - useTypography() — only typography tokens
 * - useSpacing()    — only spacing/borderRadius/iconSize tokens
 */

import {useColorScheme} from 'react-native';
import {useSelector} from 'react-redux';
import {colors, ColorTokens} from './colors';
import {buildTypography, TypographyTokens} from './typography';
import {spacing, borderRadius, iconSize, elevation} from './spacing';

// Build typography once on module load; it reads PixelRatio at startup.
// For hot-refresh sensitivity, screens can call buildTypography() inline.
const typography = buildTypography();

// ----------------------------------------------------------------------------
// Theme objects
// ----------------------------------------------------------------------------
const buildTheme = (dark: boolean) => {
  const colorTokens: ColorTokens = dark ? colors.dark : colors.light;
  return {
    dark,
    colors: colorTokens,
    typography,
    spacing,
    borderRadius,
    iconSize,
    elevation: elevation(colorTokens.shadow),
  };
};

export const lightTheme = buildTheme(false);
export const darkTheme = buildTheme(true);

export type AppTheme = typeof lightTheme;

// ----------------------------------------------------------------------------
// Redux selector type
// ----------------------------------------------------------------------------
interface ThemeState {
  theme: {mode: 'light' | 'dark' | 'system'};
}

// ----------------------------------------------------------------------------
// Hooks — each reads from the same Redux state but returns only its slice,
// so downstream components only re-render when their specific token changes.
// ----------------------------------------------------------------------------

export const useTheme = (): AppTheme => {
  const systemScheme = useColorScheme();
  const themeMode = useSelector(
    (state: ThemeState) => state.theme?.mode ?? 'system',
  );
  const isDark =
    themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark';
  return isDark ? darkTheme : lightTheme;
};

export const useColors = (): ColorTokens => useTheme().colors;

export const useTypography = (): TypographyTokens => useTheme().typography;

export const useSpacing = () => {
  const theme = useTheme();
  return {
    spacing: theme.spacing,
    borderRadius: theme.borderRadius,
    iconSize: theme.iconSize,
    elevation: theme.elevation,
  };
};
