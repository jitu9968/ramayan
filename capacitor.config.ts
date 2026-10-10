import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.jituonline.ramayan',
  appName: 'Ramayan Reader',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#FDFBF7",
      showSpinner: false,
      androidSpinnerStyle: "large",
      spinnerColor: "#D97706",
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
