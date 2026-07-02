export interface ColorTokens {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;

  background: string;
  surface: string;
  surfaceVariant: string;
  surfaceElevated: string;
  card: string;
  overlay: string;
  scrim: string;

  text: string;
  textSecondary: string;
  textDisabled: string;
  textInverse: string;

  error: string;
  errorLight: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  info: string;
  infoLight: string;

  border: string;
  divider: string;

  shadow: string;

  onPrimary: string;
  onSurface: string;
  onError: string;

  skeleton: string;
  skeletonHighlight: string;
}

export const colors: {light: ColorTokens; dark: ColorTokens} = {
  light: {
    primary: 'hsl(250, 84%, 54%)',
    primaryDark: 'hsl(250, 84%, 40%)',
    primaryLight: 'hsl(250, 84%, 94%)',
    secondary: 'hsl(280, 65%, 45%)',

    background: 'hsl(0, 0%, 100%)',
    surface: 'hsl(210, 20%, 98%)',
    surfaceVariant: 'hsl(210, 16%, 93%)',
    surfaceElevated: 'hsl(0, 0%, 100%)',
    card: 'hsl(0, 0%, 100%)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    scrim: 'rgba(0, 0, 0, 0.3)',

    text: 'hsl(222, 47%, 11%)',
    textSecondary: 'hsl(215, 16%, 47%)',
    textDisabled: 'hsl(215, 16%, 72%)',
    textInverse: 'hsl(0, 0%, 100%)',

    error: 'hsl(346, 84%, 50%)',
    errorLight: 'hsl(346, 84%, 95%)',
    success: 'hsl(142, 70%, 38%)',
    successLight: 'hsl(142, 70%, 94%)',
    warning: 'hsl(38, 92%, 45%)',
    warningLight: 'hsl(38, 92%, 94%)',
    info: 'hsl(199, 89%, 42%)',
    infoLight: 'hsl(199, 89%, 94%)',

    border: 'hsl(214, 32%, 91%)',
    divider: 'hsl(214, 32%, 94%)',

    shadow: 'rgba(0, 0, 0, 0.06)',

    onPrimary: 'hsl(0, 0%, 100%)',
    onSurface: 'hsl(222, 47%, 11%)',
    onError: 'hsl(0, 0%, 100%)',

    skeleton: 'hsl(214, 20%, 90%)',
    skeletonHighlight: 'hsl(214, 20%, 97%)',
  },

  dark: {
    primary: 'hsl(250, 95%, 72%)',
    primaryDark: 'hsl(250, 95%, 60%)',
    primaryLight: 'hsl(250, 50%, 20%)',
    secondary: 'hsl(280, 80%, 72%)',

    background: 'hsl(222, 47%, 5%)',
    surface: 'hsl(222, 40%, 9%)',
    surfaceVariant: 'hsl(222, 35%, 14%)',
    surfaceElevated: 'hsl(222, 35%, 12%)',
    card: 'hsl(222, 40%, 9%)',
    overlay: 'rgba(0, 0, 0, 0.7)',
    scrim: 'rgba(0, 0, 0, 0.5)',

    text: 'hsl(210, 40%, 98%)',
    textSecondary: 'hsl(215, 20%, 68%)',
    textDisabled: 'hsl(215, 15%, 40%)',
    textInverse: 'hsl(222, 47%, 5%)',

    error: 'hsl(346, 84%, 65%)',
    errorLight: 'hsl(346, 50%, 18%)',
    success: 'hsl(142, 70%, 55%)',
    successLight: 'hsl(142, 40%, 14%)',
    warning: 'hsl(38, 92%, 58%)',
    warningLight: 'hsl(38, 60%, 15%)',
    info: 'hsl(199, 89%, 58%)',
    infoLight: 'hsl(199, 50%, 14%)',

    border: 'hsl(217, 24%, 16%)',
    divider: 'hsl(217, 24%, 13%)',

    shadow: 'rgba(0, 0, 0, 0.4)',

    onPrimary: 'hsl(0, 0%, 100%)',
    onSurface: 'hsl(210, 40%, 98%)',
    onError: 'hsl(0, 0%, 100%)',

    skeleton: 'hsl(222, 30%, 16%)',
    skeletonHighlight: 'hsl(222, 25%, 22%)',
  },
};
