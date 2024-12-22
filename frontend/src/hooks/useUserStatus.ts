import { useState, useEffect } from "react";
import * as RNIap from "react-native-iap";
import { Alert, Platform } from "react-native";
import Constants from "expo-constants";
import { router } from "expo-router";
import userProfileService from "@services/data/userProfileService";
import { useAppSelector } from "@src/redux/hooks";
import { selectUserData } from "@src/redux/slices/userSlice";

const { updatePurchasedExtraContent, getUserPremiumStatus } =
  userProfileService;

const itemSkus: string[] =
  Platform.select({
    ios: [Constants.expoConfig?.extra?.iosProductId || ""],
    android: [Constants.expoConfig?.extra?.androidProductId || ""],
  }) || [];

// **Add Alert to show SKUs**/
Alert.alert("SKUs Set", `SKUs: ${itemSkus.join(", ")}`);

// Type guard to check if the error is an instance of Error
const isError = (error: unknown): error is Error => error instanceof Error;

// Hook for retrieving premium status
export const usePremiumStatus = () => {
  const userData = useAppSelector(selectUserData);
  const [isPremiumUser, setIsPremiumUser] = useState<boolean>(false);

  useEffect(() => {
    const fetchPremiumStatus = async () => {
      if (userData) {
        try {
          Alert.alert(
            "Fetching Premium Status",
            "Checking user premium status..."
          );
          const purchasedStatus = await getUserPremiumStatus(userData.id);
          setIsPremiumUser(purchasedStatus);
          Alert.alert(
            "Premium Status Retrieved",
            `User is ${purchasedStatus ? "Premium" : "not Premium"}.`
          );
        } catch (error: unknown) {
          console.error("Error fetching premium status:", error);
          const errorMessage = isError(error)
            ? error.message
            : "An unknown error occurred";
          Alert.alert(
            "Error",
            `Error fetching premium status: ${errorMessage}`
          );
        }
      }
    };

    fetchPremiumStatus();
  }, [userData]);

  return isPremiumUser;
};

// Hook for purchasing extra content
export const usePurchaseExtraContent = (userId: string) => {
  const [isPurchasing, setIsPurchasing] = useState(false);

  if (!userId || userId.trim() === "") {
    console.warn("Invalid userId provided to usePurchaseExtraContent.");
    Alert.alert("Error", "Invalid userId provided.");
    return {
      purchaseExtraContent: () => {
        Alert.alert("Error", "User not identified. Please try again later.");
      },
      isPurchasing: false,
    };
  }

  const purchaseExtraContent = async () => {
    setIsPurchasing(true);
    Alert.alert(
      "Initiating Purchase",
      "Attempting to purchase extra content..."
    );
    try {
      // **Add Alert to show SKUs before fetching products**
      Alert.alert("Fetching Products", `Using SKUs: ${itemSkus.join(", ")}`);

      const products = await RNIap.getProducts({ skus: itemSkus });
      if (products.length > 0) {
        Alert.alert("Product Found", "Initiating purchase process...");

        const params = Platform.select({
          ios: {
            sku: products[0].productId, // Correct parameter for iOS
            andDangerouslyFinishTransactionAutomaticallyIOS: false,
          },
          android: {
            skus: [products[0].productId], // Correct parameter for Android
          },
        });

        if (params) {
          await RNIap.requestPurchase(params);
        }
      } else {
        Alert.alert("Error", "No products found.");
      }
    } catch (err: unknown) {
      console.warn("Purchase failed:", err);
      const errorMessage = isError(err)
        ? err.message
        : "An unknown error occurred";
      Alert.alert("Purchase Failed", `Purchase failed: ${errorMessage}`);
    } finally {
      setIsPurchasing(false);
      Alert.alert("Purchase Process", "Purchase process completed.");
    }
  };

  useEffect(() => {
    const purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
      async (purchase) => {
        const receipt = purchase.transactionReceipt;
        if (receipt) {
          try {
            Alert.alert("Purchase Update", "Processing purchase receipt...");
            await updatePurchasedExtraContent(userId, true);
            await RNIap.finishTransaction({ purchase });
            Alert.alert(
              "Purchase Complete",
              "Purchase successful! Redirecting..."
            );
            router.push("/dashboard/learn");
          } catch (error: unknown) {
            console.error("Error processing receipt:", error);
            const errorMessage = isError(error)
              ? error.message
              : "An unknown error occurred";
            Alert.alert("Error", `Error processing receipt: ${errorMessage}`);
          }
        }
      }
    );

    const purchaseErrorSubscription = RNIap.purchaseErrorListener((error) => {
      console.warn("Purchase error:", error.message);
      Alert.alert(
        "Purchase Error",
        `There was an error processing your purchase: ${error.message}`
      );
    });

    return () => {
      purchaseUpdateSubscription.remove();
      purchaseErrorSubscription.remove();
    };
  }, [userId]);

  return { purchaseExtraContent, isPurchasing };
};
