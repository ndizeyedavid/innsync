const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro"); // make sure this import exists

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Alias react-native-vector-icons to @expo/vector-icons for compatibility
config.resolver.alias = {
  ...config.resolver.alias,
  "react-native-vector-icons/Ionicons": "@expo/vector-icons/Ionicons",
  "react-native-vector-icons": "@expo/vector-icons",
};

// Apply uniwind modifications before exporting
const uniwindConfig = withUniwindConfig(config, {
  // relative path to your global.css file
  cssEntryFile: "./src/global.css",
  // optional: path to typings
  dtsFile: "./src/uniwind-types.d.ts",
});

module.exports = uniwindConfig;
