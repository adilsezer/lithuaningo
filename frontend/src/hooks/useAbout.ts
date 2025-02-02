import { useCallback } from "react";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import Constants from "expo-constants";
import { useAlertDialog } from "@hooks/useAlertDialog";

export type AboutLink = {
  type: "email" | "url" | "internal";
  value: string;
  label: string;
};

export const ABOUT_LINKS = {
  email: {
    type: "email" as const,
    value: "lithuaningo@gmail.com",
    label: "Contact us via email",
  },
  privacyPolicy: {
    type: "internal" as const,
    value: "/privacy-policy",
    label: "View our Privacy Policy",
  },
  termsOfService: {
    type: "internal" as const,
    value: "/terms-of-service",
    label: "View our Terms of Service",
  },
} as const;

export const useAbout = () => {
  const router = useRouter();
  const appVersion = Constants.expoConfig?.version || "Unknown";
  const { showError } = useAlertDialog();

  const handleLinkPress = useCallback(
    async (link: AboutLink) => {
      try {
        switch (link.type) {
          case "email":
            const emailUrl = `mailto:${link.value}`;
            const canOpenEmail = await Linking.canOpenURL(emailUrl);
            if (canOpenEmail) {
              await Linking.openURL(emailUrl);
            } else {
              throw new Error("No email app configured");
            }
            break;

          case "url":
            const canOpenUrl = await Linking.canOpenURL(link.value);
            if (canOpenUrl) {
              await Linking.openURL(link.value);
            } else {
              throw new Error("Cannot open URL");
            }
            break;

          case "internal":
            router.push(link.value);
            break;

          default:
            throw new Error("Unsupported link type");
        }
      } catch (error) {
        console.error("Failed to handle link:", error);
        showError(
          error instanceof Error
            ? error.message
            : "Failed to open link. Please try again later."
        );
      }
    },
    [router]
  );

  const navigateToPrivacyPolicy = useCallback(() => {
    handleLinkPress(ABOUT_LINKS.privacyPolicy);
  }, [handleLinkPress]);

  const navigateToTermsOfService = useCallback(() => {
    handleLinkPress(ABOUT_LINKS.termsOfService);
  }, [handleLinkPress]);

  return {
    // App Info
    appVersion,
    links: ABOUT_LINKS,

    // Actions
    handleLinkPress,
    navigateToPrivacyPolicy,
    navigateToTermsOfService,
  };
};
