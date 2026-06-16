const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('mjs', 'cjs');

// Custom resolver to handle react-native-maps on web
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && (moduleName === 'react-native-maps' || moduleName.startsWith('react-native-maps/'))) {
    return context.resolveRequest(
      context,
      '@teovilla/react-native-web-maps',
      platform
    );
  }
  // Default resolver for other modules
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
