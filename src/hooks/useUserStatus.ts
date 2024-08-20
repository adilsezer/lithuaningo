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

// Hook for retrieving premium status
export const usePremiumStatus = () => {
  const userData = useAppSelector(selectUserData);
  const [isPremiumUser, setIsPremiumUser] = useState<boolean>(false);

  useEffect(() => {
    const fetchPremiumStatus = async () => {
      if (userData) {
        try {
          const purchasedStatus = await getUserPremiumStatus(userData.id);
          setIsPremiumUser(purchasedStatus);
        } catch (error) {
          console.error("Error fetching premium status:", error);
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

  // Handle case where userId is an empty string
  if (!userId || userId.trim() === "") {
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
          await updatePurchasedExtraContent(userId, true);
          await RNIap.finishTransaction({ purchase });
          router.push("/dashboard/learn");
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
