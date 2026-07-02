module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@app': './src/app',
          '@navigation': './src/navigation',
          '@theme': './src/theme',
          '@common': './src/common',
          '@features': './src/features',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
