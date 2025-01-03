import "dotenv/config";
import { ExpoConfig, ConfigContext } from "@expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    name: "Lithuaningo",
    slug: "lithuaningo",
    version: "2.7.0",
    orientation: "portrait",
    icon: "./assets/icons/ios/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash.jpeg",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      googleServicesFile: "./GoogleService-Info.plist",
      supportsTablet: true,
      bundleIdentifier: "com.adilsezer.lithuaningo",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        UIBackgroundModes: ["fetch"],
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true,
          NSExceptionDomains: {
            localhost: {
              NSExceptionAllowsInsecureHTTPLoads: true,
              NSIncludesSubdomains: true
            }
          }
        }
      },
      usesAppleSignIn: true,
    },
    android: {
      googleServicesFile: "./google-services.json",
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
      "@react-native-firebase/app",
      "@react-native-firebase/crashlytics",
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
    extra: {
      eas: {
        projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
      },
      easProjectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
      googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      androidGoogleServicesBase64: process.env.ANDROID_GOOGLE_SERVICES_BASE64,
      iosGoogleServicesBase64: process.env.IOS_GOOGLE_SERVICES_BASE64,
      iosProductId: process.env.IOS_PRODUCT_ID,
      androidProductId: process.env.ANDROID_PRODUCT_ID,
      privacyPolicyUrl:
        "https://adilsezer.github.io/lithuaningo/privacy-policy",
      keywords:
        "Lithuanian language, Language learning, Language app, Language courses, Learning Lithuanian, Lithuanian lessons, Vocabulary practice, Language quizzes, Interactive learning",
    },
    scheme: "lithuaningo",
  };
};
