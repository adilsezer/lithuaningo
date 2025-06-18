import "dotenv/config";
import { ExpoConfig, ConfigContext } from "@expo/config";

// Inline environment validation (can't import TS modules at config time)
const REQUIRED_ENV_VARS = [
  "EXPO_PUBLIC_SUPABASE_URL",
  "EXPO_PUBLIC_SUPABASE_ANON_KEY",
  "EXPO_PUBLIC_EAS_PROJECT_ID",
] as const;

const validateEnvironmentVariables = (): void => {
  const missing: string[] = [];

  REQUIRED_ENV_VARS.forEach((envVar) => {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
        "Please check your .env file or environment configuration."
    );
  }
};

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
};

const getOptionalEnv = (key: string, defaultValue = ""): string => {
  return process.env[key] || defaultValue;
};

// Validate environment variables early
validateEnvironmentVariables();

export default ({ config }: ConfigContext): ExpoConfig => {
  // Native configuration values – needed at build time
  const nativeGoogleConfig = {
    iosGoogleServicesFile: process.env.IOS_GOOGLE_SERVICES_BASE64,
    androidGoogleServicesFile: process.env.ANDROID_GOOGLE_SERVICES_BASE64,
    // This should be the reversed client ID provided by Google for iOS.
    iosClientId: getOptionalEnv("EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID"),
    androidClientId: getOptionalEnv("EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID"),
  };

  // Runtime values – accessible in JavaScript via Constants.expoConfig.extra
  const runtimeConfig = {
    eas: {
      projectId: getRequiredEnv("EXPO_PUBLIC_EAS_PROJECT_ID"),
    },
    easProjectId: getRequiredEnv("EXPO_PUBLIC_EAS_PROJECT_ID"),
    googleWebClientId: getOptionalEnv("EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID"),
    googleIosClientId: nativeGoogleConfig.iosClientId,
    googleAndroidClientId: nativeGoogleConfig.androidClientId,
    iosProductId: process.env.IOS_PRODUCT_ID,
    androidProductId: process.env.ANDROID_PRODUCT_ID,
    supabaseUrl: getRequiredEnv("EXPO_PUBLIC_SUPABASE_URL"),
    supabaseAnonKey: getRequiredEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY"),
    privacyPolicyUrl: "https://adilsezer.github.io/lithuaningo/privacy-policy",
    keywords:
      "Lithuanian language, Language learning, Language app, Language courses, Learning Lithuanian, Lithuanian lessons, Vocabulary practice, Language challenges, Interactive learning",
  };

  return {
    ...config,
    name: "Lithuaningo",
    slug: "lithuaningo",
    version: "3.0.0",
    orientation: "portrait",
    icon: "./assets/icons/ios/icon.png",
    userInterfaceStyle: "automatic",
    scheme: "com.adilsezer.lithuaningo",
    splash: {
      image: "./assets/images/splash.jpeg",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.adilsezer.lithuaningo",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        UIBackgroundModes: ["fetch"],
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads:
            process.env.NODE_ENV === "development" ? true : false,
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
                nativeGoogleConfig.iosClientId?.split(".")[0]
              }`,
            ],
          },
        ],
      },
      usesAppleSignIn: true,
    },
    android: {
      icon: "./assets/icons/android/xxxhdpi/icon.png",
      adaptiveIcon: {
        foregroundImage: "./assets/icons/android/foreground.png",
        backgroundImage: "./assets/icons/android/background.png",
      },
      package: "com.adilsezer.lithuaningo",
      versionCode: 20,
      permissions: [
        "INTERNET",
        "ACCESS_NETWORK_STATE",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "RECEIVE_BOOT_COMPLETED",
        "SCHEDULE_EXACT_ALARM",
        "POST_NOTIFICATIONS",
        "BILLING",
      ],
    },
    web: {
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static",
          },
          android: {
            enableProguardInReleaseBuilds: true,
            extraProguardRules: "-keep public class com.horcrux.svg.** {*;}",
            allowBackup: false,
          },
        },
      ],
      "expo-font",
      "expo-apple-authentication",
      [
        "expo-notifications",
        {
          icon: "./assets/images/icon.png",
          color: "#ffffff",
          defaultChannel: "default",
        },
      ],
    ],
    extra: runtimeConfig,
  };
};
