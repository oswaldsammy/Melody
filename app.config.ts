import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Melody',
  slug: 'Melody',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'melody',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#7C3AED',
  },
  ios: { supportsTablet: false, bundleIdentifier: 'com.melody.app' },
  android: {
    adaptiveIcon: { foregroundImage: './assets/adaptive-icon.png', backgroundColor: '#7C3AED' },
    package: 'com.melody.app',
    edgeToEdgeEnabled: true,
  },
  plugins: [
    'expo-router',
    'expo-image-picker',
    ['expo-notifications', { icon: './assets/icon.png', color: '#7C3AED' }],
  ],
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    eas: { projectId: process.env.EAS_PROJECT_ID },
  },
});
