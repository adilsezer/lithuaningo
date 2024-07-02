import "dotenv/config";
import { ExpoConfig, ConfigContext } from "@expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    name: "Lithuaningo",
    slug: "lithuaningo",
    version: "1.4.0",
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
        },
      ],
      "expo-font",
      "expo-apple-authentication",
    ],
    extra: {
      easProjectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
      privacyPolicyUrl:
        "https://adilsezer.github.io/lithuaningo/privacy-policy",
      keywords:
        "Lithuanian language, Language learning, Language app, Language courses, Learning Lithuanian, Lithuanian lessons, Vocabulary practice, Language quizzes, Interactive learning",
    },
    scheme: "lithuaningo",
  };
};
