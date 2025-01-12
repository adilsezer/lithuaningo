import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import Constants from "expo-constants";
import { AlertDialog } from "@components/ui/AlertDialog";

export const useAbout = () => {
  const router = useRouter();
  const appVersion = Constants.expoConfig?.version || "Unknown";

  const handleLinkPress = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        AlertDialog.error(
          "Unable to open the link. Please check if the app to handle the URL is installed and configured."
        );
        console.error("Unsupported URL: ", url);
      }
    } catch (err) {
      AlertDialog.error(
        "An error occurred while trying to open the URL. Please try again later."
      );
      console.error("Failed to open URL:", err);
    }
  };

  const navigateToPrivacyPolicy = () => {
    router.push("/privacy-policy");
  };

  return {
    appVersion,
    handleLinkPress,
    navigateToPrivacyPolicy,
  };
};
