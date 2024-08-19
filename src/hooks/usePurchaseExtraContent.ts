import { useState, useEffect } from "react";
import * as RNIap from "react-native-iap";
import { Alert, Platform } from "react-native";
import Constants from "expo-constants";
import { router } from "expo-router";
import userProfileService from "@services/data/userProfileService";

const { updatePurchasedExtraContent } = userProfileService;

const itemSkus: string[] =
  Platform.select({
    ios: [Constants.expoConfig?.extra?.iosProductId || ""],
    android: [Constants.expoConfig?.extra?.androidProductId || ""],
  }) || [];

export const usePurchaseExtraContent = (userId: string) => {
  const [isPurchasing, setIsPurchasing] = useState(false);

  if (!userId) {
    console.warn("Invalid userId provided to usePurchaseExtraContent.");
    return {
      purchaseExtraContent: () => {
        Alert.alert("Error", "User not identified. Please try again later.");
      },
      isPurchasing: false,
    };
  }

  const purchaseExtraContent = async () => {
    setIsPurchasing(true);
    try {
      const products = await RNIap.getProducts({ skus: itemSkus });
      if (products.length > 0) {
        await RNIap.requestPurchase({ sku: products[0].productId });
      } else {
        Alert.alert("Error", "No products found.");
      }
    } catch (err: any) {
      console.warn("Purchase failed:", err.message);
    } finally {
      setIsPurchasing(false);
    }
  };

  useEffect(() => {
    const purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
      async (purchase) => {
        const receipt = purchase.transactionReceipt;
        if (receipt) {
          await updatePurchasedExtraContent(userId, true); // Await here to ensure the update is completed
          await RNIap.finishTransaction({ purchase });
          router.push("/learning/sentences");
        }
      }
    );

    const purchaseErrorSubscription = RNIap.purchaseErrorListener((error) => {
      console.warn("Purchase error:", error.message);
      Alert.alert(
        "Purchase Error",
        "There was an error processing your purchase."
      );
    });

    return () => {
      purchaseUpdateSubscription.remove();
      purchaseErrorSubscription.remove();
    };
  }, [userId]);

  return { purchaseExtraContent, isPurchasing };
};
