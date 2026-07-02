module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@APIServices': './src/APIServices',
          '@Components': './src/Components',
          '@Constance': './src/Constance',
          '@Routes': './src/Routes',
          '@Screens': './src/Screens',
          '@Store': './src/Store',
          '@Utils': './src/Utils',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
