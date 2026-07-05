// Colors configuration for light and dark themes

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
    primary: 'hsl(218, 100%, 25%)', // Paytm Deep Blue (#002E7E)
    primaryDark: 'hsl(218, 100%, 15%)',
    primaryLight: 'hsl(210, 100%, 95%)', // Very soft sky blue background
    secondary: 'hsl(194, 100%, 47%)', // Paytm Cyan (#00BAF2)

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

    shadow: 'rgba(0, 29, 76, 0.05)', // Paytm navy tinted shadow

    onPrimary: 'hsl(0, 0%, 100%)',
    onSurface: 'hsl(222, 47%, 11%)',
    onError: 'hsl(0, 0%, 100%)',

    skeleton: 'hsl(214, 20%, 90%)',
    skeletonHighlight: 'hsl(214, 20%, 97%)',
  },

  dark: {
    primary: 'hsl(194, 100%, 47%)', // Paytm Cyan for visibility in dark mode
    primaryDark: 'hsl(218, 100%, 25%)', // Paytm Deep Blue
    primaryLight: 'rgba(0, 186, 242, 0.15)',
    secondary: 'hsl(194, 100%, 47%)',

    background: 'hsl(218, 50%, 6%)', // Deep corporate navy background
    surface: 'hsl(218, 40%, 10%)',
    surfaceVariant: 'hsl(218, 35%, 15%)',
    surfaceElevated: 'hsl(218, 35%, 12%)',
    card: 'hsl(218, 40%, 10%)',
    overlay: 'rgba(0, 0, 0, 0.7)',
    scrim: 'rgba(0, 0, 0, 0.5)',

    text: 'hsl(210, 40%, 98%)',
    textSecondary: 'hsl(215, 20%, 70%)',
    textDisabled: 'hsl(215, 15%, 40%)',
    textInverse: 'hsl(218, 50%, 6%)',

    error: 'hsl(346, 84%, 65%)',
    errorLight: 'hsl(346, 50%, 18%)',
    success: 'hsl(142, 70%, 55%)',
    successLight: 'hsl(142, 40%, 14%)',
    warning: 'hsl(38, 92%, 58%)',
    warningLight: 'hsl(38, 60%, 15%)',
    info: 'hsl(199, 89%, 58%)',
    infoLight: 'hsl(199, 50%, 14%)',

    border: 'hsl(218, 30%, 18%)',
    divider: 'hsl(218, 30%, 15%)',

    shadow: 'rgba(0, 0, 0, 0.5)',

    onPrimary: 'hsl(218, 50%, 6%)',
    onSurface: 'hsl(210, 40%, 98%)',
    onError: 'hsl(0, 0%, 100%)',

    skeleton: 'hsl(218, 30%, 16%)',
    skeletonHighlight: 'hsl(218, 25%, 22%)',
  },
};

export const COLORS = {
  LIGHT_GRAY: '#EFEFEF',
  DARK_BLUE: '#001D4C',
  Blue: 'blue',
  LIGHT_BLUE: '#D1EEFF',
  AzureBlue: '#e3e9af',
  TITLE_COLOR: 'red',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GRAY: '#757575',
  Back: '0000',
  BlackGray: '#222222',
  EXTLight_GRAY: '#c7d1c9',
  Smoot_Gray: '#cccaca',
  BackgroundColor: '#EFEFEF',
  Driftwood: '#8b8a35',
  DarkGray: '#9A9A9A',
  Gray: '#8D8E90',
  GunmetalGray: '#818589',
  LightGray: '#D3D3D3',
  PewterGray: '#899499',
  Platinum: '#E5E4E2',
  Silver: '#C0C0C0',
  Smoke: '#848884',
  SteelGray: '#71797E',
  Merino: '#F5EEE2',
  Sycamore: '#987A36',
  Success: '#5cb85c',
  SmoothSuccess: '#a3faf4',
  DarkSuccess: '#2f653c',
  SmoothTomato: '#fAE0E1',
  Placeholder: '#8e8e8e',
  Tomato: 'tomato',
  waterBlue: '#3a86ff',
  hippieBlue: '#6698bc',
  heather: '#C3D1DA',
  Positive: 'green',
  OrangePending: '#d36b08',
  OrangeLight: '#FF5602',
  Negitive: 'orange',
  LightOrange: '#FFFEFE3',
  DarkBrown: '#92722A',
  PaleGreen: '#D1F1CE',
  BorderColor: '#d1bc6d',
};
