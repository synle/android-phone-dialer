module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@core': './src/core',
          '@services': './src/services',
          '@screens': './src/screens',
          '@components': './src/components',
          '@hooks': './src/hooks',
        },
      },
    ],
  ],
};
