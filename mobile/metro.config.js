// Standalone Expo app (not a workspace), so the default Metro config is all we
// need — dependencies live in mobile/node_modules.
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

module.exports = config;
