module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // This is the plugin that teaches Metro what the '@/' alias means.
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          "@": "./src",
        },
      },
    ],
    // Reanimated plugin must be last.
    'react-native-reanimated/plugin',
  ],
};

