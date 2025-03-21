import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import { useTheme, Card, Text, Divider } from "react-native-paper";
import { Stack } from "expo-router";
import { useRevenueCat } from "@hooks/useRevenueCat";
import CustomButton from "@components/ui/CustomButton";
import LoadingIndicator from "@components/ui/LoadingIndicator";
import { useAlertDialog } from "@hooks/useAlertDialog";
import { useIsLoading } from "@stores/useUIStore";

export default function PremiumFeaturesScreen() {
  const theme = useTheme();
  const { offerings, purchasePackage } = useRevenueCat();
  const globalIsLoading = useIsLoading();
  const alertDialog = useAlertDialog();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    contentContainer: {
      padding: 24,
    },
    premiumImage: {
      width: "100%",
      height: 300,
      resizeMode: "contain",
      marginBottom: 20,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme.colors.primary,
      textAlign: "center",
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
      textAlign: "center",
      marginBottom: 32,
    },
    featureContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    featureDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.primary,
      marginRight: 12,
    },
    featureText: {
      fontSize: 16,
      color: theme.colors.onBackground,
    },
    planContainer: {
      marginTop: 20,
      marginBottom: 16,
    },
    card: {
      marginBottom: 12,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
    },
    cardInner: {
      overflow: "hidden",
      borderRadius: 12,
    },
    selectedCard: {
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    cardContent: {
      padding: 20,
    },
    packageTitle: {
      fontSize: 18,
      fontWeight: "bold",
    },
    packagePrice: {
      fontSize: 15,
      marginTop: 4,
      color: theme.colors.onSurfaceVariant,
    },
  });

  const handleUpgradeToPremium = async () => {
    try {
      if (!offerings) {
        alertDialog.showAlert({
          title: "Offerings Not Available",
          message:
            "Unable to fetch subscription options. Please try again later.",
          buttons: [{ text: "OK", onPress: () => {} }],
        });
        return;
      }

      let premiumPackage;

      if (selectedPackage === "monthly") {
        premiumPackage = offerings.availablePackages.find(
          (pkg) => pkg.packageType === "MONTHLY"
        );
      } else if (selectedPackage === "yearly") {
        premiumPackage = offerings.availablePackages.find(
          (pkg) => pkg.packageType === "ANNUAL"
        );
      } else if (selectedPackage === "lifetime") {
        premiumPackage = offerings.availablePackages.find(
          (pkg) => pkg.packageType === "LIFETIME"
        );
      } else {
        alertDialog.showAlert({
          title: "Select a Plan",
          message: "Please select a subscription plan first.",
          buttons: [{ text: "OK", onPress: () => {} }],
        });
        return;
      }

      if (!premiumPackage) {
        alertDialog.showAlert({
          title: "Premium Not Available",
          message:
            "Selected premium subscription is not available at the moment. Please try again later.",
          buttons: [{ text: "OK", onPress: () => {} }],
        });
        return;
      }

      await purchasePackage(premiumPackage);

      alertDialog.showAlert({
        title: "Subscription Successful",
        message:
          "You are now a premium user! Enjoy all premium features of Lithuaningo.",
        buttons: [{ text: "Great!", onPress: () => {} }],
      });
    } catch (error: any) {
      // User cancelled purchase, don't show an error
      if (error.code === "PURCHASE_CANCELLED_ERROR") {
        return;
      }

      alertDialog.showAlert({
        title: "Purchase Error",
        message:
          error.message ||
          "There was an error processing your purchase. Please try again later.",
        buttons: [{ text: "OK", onPress: () => {} }],
      });
    }
  };

  // Simplified feature list
  const features = [
    "Unlimited AI chat sessions",
    "Unlimited challenges & practice",
    "Ad-free premium experience",
    "Priority support & exclusive content",
  ];

  if (globalIsLoading) {
    return <LoadingIndicator modal={false} />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Stack.Screen options={{ title: "Go Premium" }} />

      <Image
        source={require("assets/images/premium_screen.jpeg")}
        style={styles.premiumImage}
        accessibilityLabel="Premium features illustration"
      />

      <Text style={styles.subtitle}>
        Unlock unlimited learning and accelerate your progress
      </Text>

      {features.map((feature, index) => (
        <View key={index} style={styles.featureContainer}>
          <View style={styles.featureDot} />
          <Text style={styles.featureText}>{feature}</Text>
        </View>
      ))}

      <View style={styles.planContainer}>
        <Card
          style={[
            styles.card,
            selectedPackage === "monthly" && styles.selectedCard,
          ]}
          onPress={() => setSelectedPackage("monthly")}
        >
          <View style={styles.cardInner}>
            <Card.Content style={styles.cardContent}>
              <Text style={styles.packageTitle}>Monthly</Text>
              <Text style={styles.packagePrice}>
                {offerings?.availablePackages.find(
                  (pkg) => pkg.packageType === "MONTHLY"
                )?.product?.priceString || "$4.99"}{" "}
                per month
              </Text>
            </Card.Content>
          </View>
        </Card>

        <Card
          style={[
            styles.card,
            selectedPackage === "yearly" && styles.selectedCard,
          ]}
          onPress={() => setSelectedPackage("yearly")}
        >
          <View style={styles.cardInner}>
            <Card.Content style={styles.cardContent}>
              <Text style={styles.packageTitle}>Annual</Text>
              <Text style={styles.packagePrice}>
                {offerings?.availablePackages.find(
                  (pkg) => pkg.packageType === "ANNUAL"
                )?.product?.priceString || "$39.99"}{" "}
                per year (33% off)
              </Text>
            </Card.Content>
          </View>
        </Card>

        <Card
          style={[
            styles.card,
            selectedPackage === "lifetime" && styles.selectedCard,
          ]}
          onPress={() => setSelectedPackage("lifetime")}
        >
          <View style={styles.cardInner}>
            <Card.Content style={styles.cardContent}>
              <Text style={styles.packageTitle}>Lifetime</Text>
              <Text style={styles.packagePrice}>
                {offerings?.availablePackages.find(
                  (pkg) => pkg.packageType === "LIFETIME"
                )?.product?.priceString || "$99.99"}{" "}
                one-time
              </Text>
            </Card.Content>
          </View>
        </Card>
      </View>

      <View>
        <CustomButton
          title="Upgrade Now"
          mode="contained"
          onPress={handleUpgradeToPremium}
          disabled={!selectedPackage}
        />
      </View>
    </ScrollView>
  );
}
