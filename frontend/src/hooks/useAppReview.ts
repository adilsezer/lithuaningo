import { useState, useEffect, useCallback } from "react";
import { Platform } from "react-native";
import * as StoreReview from "expo-store-review";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  REVIEW_REQUESTED: "review_requested",
  REVIEW_DISMISSED: "review_dismissed",
} as const;

export const useAppReview = () => {
  const [shouldShowReview, setShouldShowReview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkShouldShowReview = useCallback(async () => {
    try {
      // Check if review was already requested
      const reviewRequested = await AsyncStorage.getItem(
        STORAGE_KEYS.REVIEW_REQUESTED
      );
      if (reviewRequested === "true") {
        return;
      }

      // Check if review was dismissed
      const reviewDismissed = await AsyncStorage.getItem(
        STORAGE_KEYS.REVIEW_DISMISSED
      );
      if (reviewDismissed === "true") {
        return;
      }

      // Show review card if neither requested nor dismissed
      setShouldShowReview(true);
    } catch (error) {
      console.error("Error checking review status:", error);
    }
  }, []);

  const requestReview = useCallback(async () => {
    try {
      setIsLoading(true);

      // Check if in-app review is available
      const isAvailable = await StoreReview.isAvailableAsync();

      if (isAvailable) {
        // Use native in-app review
        await StoreReview.requestReview();
      } else {
        // Fallback to store URL (shouldn't happen on modern devices)
        console.log("In-app review not available, would redirect to store");
      }

      // Mark review as requested
      await AsyncStorage.setItem(STORAGE_KEYS.REVIEW_REQUESTED, "true");
      setShouldShowReview(false);
    } catch (error) {
      console.error("Error requesting review:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const dismissReview = useCallback(async () => {
    try {
      // Mark review as dismissed
      await AsyncStorage.setItem(STORAGE_KEYS.REVIEW_DISMISSED, "true");
      setShouldShowReview(false);
    } catch (error) {
      console.error("Error dismissing review:", error);
    }
  }, []);

  useEffect(() => {
    checkShouldShowReview();
  }, [checkShouldShowReview]);

  const storeText = Platform.OS === "ios" ? "App Store" : "Google Play";
  const storeIcon = Platform.OS === "ios" ? "apple" : "google-play";

  return {
    shouldShowReview,
    isLoading,
    requestReview,
    dismissReview,
    storeText,
    storeIcon,
  };
};
