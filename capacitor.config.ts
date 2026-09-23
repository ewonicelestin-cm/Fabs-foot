import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fabfoot.ia',
  appName: "FAB-FOOT",
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
