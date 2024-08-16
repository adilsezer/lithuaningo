import { useState, useEffect } from "react";
import * as RNIap from "react-native-iap";
import { Alert, Platform } from "react-native";
import firestore from "@react-native-firebase/firestore";
import { COLLECTIONS } from "@config/constants"; // Adjust the import path as needed
import Constants from "expo-constants";
import { router } from "expo-router";

const itemSkus: string[] =
  Platform.select({
    ios: [Constants.expoConfig?.extra?.iosProductId || ""],
    android: [Constants.expoConfig?.extra?.androidProductId || ""],
  }) || [];

export const usePurchaseExtraContent = (userId: string) => {
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Handle the case where userId is an empty string
  if (!userId) {
    console.warn("Invalid userId provided to usePurchaseExtraContent.");
    return {
      purchaseExtraContent: () => {
        Alert.alert("Error", "User not identified. Please try again later.");
      },
      isPurchasing: false,
    };
  }

  const updateUserProfileAfterPurchase = async () => {
    try {
      const userDocRef = firestore().collection(COLLECTIONS.USERS).doc(userId);
      const userDoc = await userDocRef.get();

      if (userDoc.exists) {
        await userDocRef.update({
          hasPurchasedExtraContent: true,
        });
      } else {
        await userDocRef.set({
          hasPurchasedExtraContent: true,
          // Add any other fields you might need here
        });
      }
    } catch (error) {
      console.error("Error updating user profile after purchase:", error);
    }
  };

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
      // Specify the error type
      console.warn("Purchase failed:", err.message);
    } finally {
      setIsPurchasing(false);
    }
  };

  useEffect(() => {
    const purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
      (purchase) => {
        const receipt = purchase.transactionReceipt;
        if (receipt) {
          // Process the receipt and unlock content
          updateUserProfileAfterPurchase(); // Update the user profile in Firestore
          RNIap.finishTransaction({ purchase }); // Pass an object with the purchase property
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
  }, []);

  return { purchaseExtraContent, isPurchasing };
};
