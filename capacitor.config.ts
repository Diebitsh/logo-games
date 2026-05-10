import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.logogames.client',
  appName: 'LogoGames',
  webDir: 'dist/logo-games/browser',
  bundledWebRuntime: false,
  android: {
    allowMixedContent: true,
  },
  ios: {
    contentInset: 'always',
  },
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#4f46e5',
    },
  },
};

export default config;
