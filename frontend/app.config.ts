import 'dotenv/config';
import { ExpoConfig, ConfigContext } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  // Native configuration values – needed at build time
  const nativeGoogleConfig = {
    iosGoogleServicesFile: process.env.IOS_GOOGLE_SERVICES_BASE64,
    androidGoogleServicesFile: process.env.ANDROID_GOOGLE_SERVICES_BASE64,
    // This should be the reversed client ID provided by Google for iOS.
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  };

  // Runtime values – accessible in JavaScript via Constants.expoConfig.extra
  const runtimeConfig = {
    eas: {
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
    },
    easProjectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
    googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    googleIosClientId: nativeGoogleConfig.iosClientId,
    googleAndroidClientId: nativeGoogleConfig.androidClientId,
    iosProductId: process.env.IOS_PRODUCT_ID,
    androidProductId: process.env.ANDROID_PRODUCT_ID,
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    privacyPolicyUrl: 'https://adilsezer.github.io/lithuaningo/privacy-policy',
    keywords:
      'Lithuanian language, Language learning, Language app, Language courses, Learning Lithuanian, Lithuanian lessons, Vocabulary practice, Language challenges, Interactive learning',
  };

  return {
    ...config,
    name: 'Lithuaningo',
    slug: 'lithuaningo',
    version: '3.0.0',
    orientation: 'portrait',
    icon: './assets/icons/ios/icon.png',
    userInterfaceStyle: 'automatic',
    scheme: 'com.adilsezer.lithuaningo',
    splash: {
      image: './assets/images/splash.jpeg',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.adilsezer.lithuaningo',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        UIBackgroundModes: ['fetch'],
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true,
          NSExceptionDomains: {
            localhost: {
              NSExceptionAllowsInsecureHTTPLoads: true,
              NSIncludesSubdomains: true,
            },
          },
        },
        CFBundleURLTypes: [
          {
            CFBundleURLSchemes: [
              `com.googleusercontent.apps.${
                nativeGoogleConfig.iosClientId?.split('.')[0]
              }`,
            ],
          },
        ],
      },
      usesAppleSignIn: true,
    },
    android: {
      icon: './assets/icons/android/xxxhdpi/icon.png',
      adaptiveIcon: {
        foregroundImage: './assets/icons/android/foreground.png',
        backgroundImage: './assets/icons/android/background.png',
      },
      package: 'com.adilsezer.lithuaningo',
      versionCode: 20,
      permissions: [
        'INTERNET',
        'ACCESS_NETWORK_STATE',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
        'RECEIVE_BOOT_COMPLETED',
        'SCHEDULE_EXACT_ALARM',
        'POST_NOTIFICATIONS',
        'BILLING',
      ],
    },
    web: {
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-build-properties',
        {
          ios: {
            useFrameworks: 'static',
          },
          android: {
            enableProguardInReleaseBuilds: true,
            extraProguardRules: '-keep public class com.horcrux.svg.** {*;}',
            allowBackup: false,
          },
        },
      ],
      'expo-font',
      'expo-apple-authentication',
      [
        'expo-notifications',
        {
          icon: './assets/images/icon.png',
          color: '#ffffff',
          defaultChannel: 'default',
        },
      ],
    ],
    extra: runtimeConfig,
  };
};
