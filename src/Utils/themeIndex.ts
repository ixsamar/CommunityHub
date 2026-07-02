import {useColorScheme} from 'react-native';
import {useSelector} from 'react-redux';
import {colors, ColorTokens} from './Colors';
import {buildTypography, TypographyTokens} from './typography';
import {spacing, borderRadius, iconSize, elevation} from './spacing';

const typography = buildTypography();

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

interface ThemeState {
  theme: {mode: 'light' | 'dark' | 'system'};
}

export const useTheme = (): AppTheme => {
  const systemScheme = useColorScheme();
  const themeMode = useSelector((state: ThemeState) => state.theme?.mode ?? 'system');
  const isDark = themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark';
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
