import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import {
  useTheme,
  Card,
  Text,
  Surface,
  List,
  Divider,
} from "react-native-paper";
import { router } from "expo-router";
import { useRevenueCat } from "@hooks/useRevenueCat";
import CustomButton from "@components/ui/CustomButton";
import LoadingIndicator from "@components/ui/LoadingIndicator";
import { useAlertDialog } from "@hooks/useAlertDialog";
import { useIsLoading, useSetLoading, useSetError } from "@stores/useUIStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RC_PACKAGE_TYPES } from "@config/revenuecat.config";
import { useUserStore } from "@stores/useUserStore";

// Feature list definition with icons
const FEATURES = [
  {
    icon: "robot" as const,
    text: "Master Lithuanian Faster",
    description:
      "Get instant help from your AI tutor whenever you're stuck - no daily limits holding you back",
  },
  {
    icon: "cards" as const,
    text: "Practice Without Interruptions",
    description:
      "Study at your own pace with unlimited flashcards - perfect your vocabulary daily",
  },
  {
    icon: "shield-check" as const,
    text: "Distraction-Free Learning",
    description:
      "Focus completely on Lithuanian without ads breaking your concentration",
  },
];

// Comparison table data
const COMPARISON_DATA = [
  { feature: "AI chat messages", free: "5/day", premium: "Unlimited" },
  { feature: "Flashcard views", free: "10/day", premium: "Unlimited" },
  { feature: "Daily challenges", free: "✓ Included", premium: "✓ Included" },
  { feature: "Weekly leaderboard", free: "✓ Included", premium: "✓ Included" },
  { feature: "Ad-free experience", free: false, premium: true },
];

export default function PremiumFeaturesScreen() {
  const theme = useTheme();
  const {
    offerings,
    purchasePackage,
    restorePurchases,
    isPremium,
    showManageSubscriptions,
  } = useRevenueCat();
  const globalIsLoading = useIsLoading();
  const setLoading = useSetLoading();
  const setError = useSetError();
  const alertDialog = useAlertDialog();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(
    "yearly"
  );

  // Clear any existing errors when entering this screen
  useEffect(() => {
    setError(null);
  }, [setError]);

  const offeringsAvailable = (offerings?.availablePackages?.length ?? 0) > 0;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    contentContainer: {
      padding: 16,
      paddingBottom: 40,
    },
    imageContainer: {
      width: "100%",
      marginBottom: 20,
    },
    premiumImage: {
      width: "100%",
      height: 240,
      resizeMode: "cover",
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    header: {
      alignItems: "center",
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme.colors.primary,
      textAlign: "center",
      marginTop: 16,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
      textAlign: "center",
      marginBottom: 24,
    },
    valueTag: {
      backgroundColor: theme.colors.primaryContainer,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginBottom: 16,
    },
    valueTagText: {
      color: theme.colors.onPrimaryContainer,
      fontWeight: "bold",
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 12,
      marginTop: 20,
    },
    featureDescription: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 13,
      marginLeft: 40,
      marginTop: -4,
      marginBottom: 12,
    },
    comparisonTable: {
      marginBottom: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.background,
    },
    tableRow: {
      flexDirection: "row",
      backgroundColor: theme.colors.background,
    },
    tableHeader: {
      backgroundColor: theme.colors.primary,
      padding: 12,
    },
    tableHeaderText: {
      fontWeight: "bold",
      fontSize: 14,
    },
    tableCell: {
      flex: 1,
      padding: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.background,
    },
    tableCellFirst: {
      flex: 2,
      alignItems: "flex-start",
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.outlineVariant,
    },
    planContainer: {
      marginVertical: 16,
    },
    card: {
      marginBottom: 12,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      elevation: 2,
    },
    selectedCard: {
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    bestValueBadge: {
      position: "absolute",
      top: 10,
      right: 10,
      backgroundColor: theme.colors.error,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      zIndex: 1,
    },
    bestValueText: {
      color: "white",
      fontSize: 12,
      fontWeight: "bold",
    },
    cardContent: {
      padding: 20,
    },
    packageTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 4,
    },
    packagePrice: {
      fontSize: 15,
      color: theme.colors.onSurfaceVariant,
    },
    savings: {
      fontSize: 13,
      marginTop: 4,
      color: theme.colors.error,
      fontWeight: "bold",
    },
    infoSection: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.secondaryContainer,
      padding: 16,
      borderRadius: 12,
    },
    infoIcon: {
      marginRight: 12,
    },
    infoText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.onSecondaryContainer,
    },
    buttonContainer: {
      marginTop: 8,
    },
    alreadyPremiumMessage: {
      paddingVertical: 16,
      alignItems: "center",
    },
    alreadyPremiumText: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.primary,
      marginBottom: 8,
    },
    alreadyPremiumDescription: {
      fontSize: 16,
      textAlign: "center",
      marginBottom: 16,
      color: theme.colors.onSurfaceVariant,
    },
    unavailableContainer: {
      paddingVertical: 40,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 20,
    },
    unavailableText: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
      textAlign: "center",
      lineHeight: 24,
    },
    legalLinksContainer: {
      alignItems: "center",
    },
    legalText: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      textAlign: "center",
      lineHeight: 18,
    },
    legalLink: {
      color: theme.colors.primary,
      textDecorationLine: "underline",
    },
  });

  const getPriceString = (packageType: string) => {
    return (
      offerings?.availablePackages.find(
        (pkg) => pkg.packageType === packageType.toUpperCase()
      )?.product?.priceString ||
      (packageType === RC_PACKAGE_TYPES.MONTHLY
        ? "€4.99"
        : packageType === RC_PACKAGE_TYPES.ANNUAL
        ? "€39.99"
        : "€99.99")
    );
  };

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

      if (!selectedPackage) {
        alertDialog.showAlert({
          title: "Select a Plan",
          message: "Please select a subscription plan first.",
          buttons: [{ text: "OK", onPress: () => {} }],
        });
        return;
      }

      const packageType =
        selectedPackage === "monthly"
          ? RC_PACKAGE_TYPES.MONTHLY
          : selectedPackage === "yearly"
          ? RC_PACKAGE_TYPES.ANNUAL
          : RC_PACKAGE_TYPES.LIFETIME;

      console.log(`[Premium] Attempting to purchase ${packageType} package`);

      const premiumPackage = offerings.availablePackages.find(
        (pkg) => pkg.packageType === packageType
      );

      if (!premiumPackage) {
        alertDialog.showAlert({
          title: "Premium Not Available",
          message:
            "Selected premium subscription is not available at the moment. Please try again later.",
          buttons: [{ text: "OK", onPress: () => {} }],
        });
        return;
      }

      console.log(
        `[Premium] Found package with identifier: ${premiumPackage.identifier}`
      );
      await purchasePackage(premiumPackage);
      console.log(
        `[Premium] Purchase completed. isPremium: ${
          useUserStore.getState().userData?.isPremium
        }`
      );

      alertDialog.showAlert({
        title: "Subscription Successful",
        message:
          "You are now a premium user! Enjoy all premium features of Lithuaningo.",
        buttons: [
          {
            text: "Great!",
            onPress: () => {
              // Navigate back to the previous screen
              router.back();
            },
          },
        ],
      });
    } catch (error: unknown) {
      // User cancelled purchase, don't show an error
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "PURCHASE_CANCELLED_ERROR"
      ) {
        return;
      }

      // Don't show server-side errors to users as they may be related to profile updating
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage && !errorMessage.includes("500")) {
        alertDialog.showAlert({
          title: "Purchase Error",
          message:
            errorMessage ||
            "There was an error processing your purchase. Please try again later.",
          buttons: [{ text: "OK", onPress: () => {} }],
        });
      } else {
        console.error("Server error during purchase process:", error);
      }
    }
  };

  const handleRestorePurchases = async () => {
    try {
      setLoading(true);
      await restorePurchases();
      alertDialog.showAlert({
        title: "Purchases Restored",
        message: "Your previous purchases have been restored successfully.",
        buttons: [{ text: "OK", onPress: () => {} }],
      });
    } catch (error: unknown) {
      console.error("Failed to restore purchases:", error);

      // Don't show server-side errors to users
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage && !errorMessage.includes("500")) {
        alertDialog.showAlert({
          title: "Restore Failed",
          message:
            "We couldn't restore your purchases. Please try again later.",
          buttons: [{ text: "OK", onPress: () => {} }],
        });
      } else {
        console.error("Server error during restore process:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (globalIsLoading && !offeringsAvailable) {
    return <LoadingIndicator modal={false} />;
  }

  // If user is already premium
  if (isPremium) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.alreadyPremiumMessage}>
          <MaterialCommunityIcons
            name="check-decagram"
            size={60}
            color={theme.colors.primary}
          />
          <Text style={styles.alreadyPremiumText}>
            You're already a Premium member!
          </Text>
          <Text style={styles.alreadyPremiumDescription}>
            You have full access to all premium features. Enjoy your learning
            journey!
          </Text>

          <CustomButton
            title="Manage Subscription"
            mode="contained"
            onPress={() => showManageSubscriptions()}
            style={{ marginTop: 16 }}
          />
        </View>
      </ScrollView>
    );
  }

  const renderPlanCard = (type: string, title: string, isBestValue = false) => {
    const isSelected = selectedPackage === type;

    return (
      <Card
        style={[styles.card, isSelected && styles.selectedCard]}
        onPress={() => setSelectedPackage(type)}
        mode="elevated"
      >
        {isBestValue && (
          <View style={styles.bestValueBadge}>
            <Text style={styles.bestValueText}>BEST VALUE</Text>
          </View>
        )}
        <Card.Content style={styles.cardContent}>
          <Text style={styles.packageTitle}>{title}</Text>

          {type === "yearly" ? (
            <>
              <Text style={styles.packagePrice}>
                {getPriceString(RC_PACKAGE_TYPES.ANNUAL)} per year
              </Text>
              <Text style={styles.savings}>
                Save 33% - Most Popular Choice!
              </Text>
            </>
          ) : type === "lifetime" ? (
            <>
              <Text style={styles.packagePrice}>
                {getPriceString(RC_PACKAGE_TYPES.LIFETIME)} one-time payment
              </Text>
              <Text style={styles.savings}>Pay once, learn forever!</Text>
            </>
          ) : (
            <Text style={styles.packagePrice}>
              {getPriceString(RC_PACKAGE_TYPES.MONTHLY)} per month
            </Text>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.imageContainer}>
          <Image
            source={require("../../../../assets/images/premium_screen.jpeg")}
            style={styles.premiumImage}
            accessibilityLabel="Premium features illustration"
          />
        </View>
        <Text style={styles.title}>Master Lithuanian Without Limits</Text>
        <View style={styles.valueTag}>
          <Text style={styles.valueTagText}>UNLOCK UNLIMITED</Text>
        </View>
        <Text style={styles.subtitle}>
          Join thousands learning Lithuanian with unlimited AI coaching and
          practice
        </Text>
      </View>

      <Text style={styles.sectionTitle}>
        Transform Your Learning Experience
      </Text>

      <List.Section style={{ marginTop: -8, marginBottom: 8 }}>
        {FEATURES.map((feature) => (
          <React.Fragment key={feature.icon}>
            <List.Item
              title={feature.text}
              titleNumberOfLines={3}
              titleStyle={{ marginRight: 24 }}
              left={() => (
                <List.Icon icon={feature.icon} color={theme.colors.primary} />
              )}
              style={{ paddingVertical: 2, marginVertical: 0 }}
            />
            <Text style={styles.featureDescription}>{feature.description}</Text>
          </React.Fragment>
        ))}
      </List.Section>

      <Text style={styles.sectionTitle}>Premium vs Free</Text>
      <Surface style={styles.comparisonTable} elevation={1}>
        <View>
          {/* Table Header */}
          <View style={styles.tableRow}>
            <View
              style={[
                styles.tableCell,
                styles.tableHeader,
                styles.tableCellFirst,
              ]}
            >
              <Text style={styles.tableHeaderText}>Feature</Text>
            </View>
            <View style={[styles.tableCell, styles.tableHeader]}>
              <Text style={styles.tableHeaderText}>Free</Text>
            </View>
            <View style={[styles.tableCell, styles.tableHeader]}>
              <Text style={styles.tableHeaderText}>Premium</Text>
            </View>
          </View>

          {/* Table Rows */}
          {COMPARISON_DATA.map((item) => (
            <React.Fragment key={item.feature}>
              <Divider style={styles.divider} />
              <View style={styles.tableRow}>
                <View style={[styles.tableCell, styles.tableCellFirst]}>
                  <Text numberOfLines={2} style={{ flexShrink: 1 }}>
                    {item.feature}
                  </Text>
                </View>
                <View style={styles.tableCell}>
                  {typeof item.free === "boolean" ? (
                    <MaterialCommunityIcons
                      name={item.free ? "check" : "close"}
                      size={20}
                      color={
                        item.free ? theme.colors.primary : theme.colors.error
                      }
                    />
                  ) : (
                    <Text>{item.free}</Text>
                  )}
                </View>
                <View style={styles.tableCell}>
                  {typeof item.premium === "boolean" ? (
                    <MaterialCommunityIcons
                      name={item.premium ? "check" : "close"}
                      size={20}
                      color={
                        item.premium ? theme.colors.primary : theme.colors.error
                      }
                    />
                  ) : (
                    <Text>{item.premium}</Text>
                  )}
                </View>
              </View>
            </React.Fragment>
          ))}
        </View>
      </Surface>

      {offeringsAvailable ? (
        <>
          <Text style={styles.sectionTitle}>Choose Your Membership</Text>
          <View style={styles.planContainer}>
            {renderPlanCard("monthly", "Monthly")}
            {renderPlanCard("yearly", "Annual", true)}
            {renderPlanCard("lifetime", "Lifetime")}
          </View>

          <Surface
            style={[styles.infoSection, { marginBottom: 24 }]}
            elevation={1}
          >
            <MaterialCommunityIcons
              name="shield-check"
              size={24}
              color={theme.colors.onSecondaryContainer}
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>
              Easy to manage. Your subscription can be changed or canceled
              anytime through your app store settings.
            </Text>
          </Surface>

          <View style={styles.buttonContainer}>
            <CustomButton
              title={`Start Premium ${
                selectedPackage === "monthly"
                  ? "Monthly"
                  : selectedPackage === "yearly"
                  ? "Annual"
                  : selectedPackage === "lifetime"
                  ? "Lifetime"
                  : ""
              }`}
              mode="contained"
              onPress={handleUpgradeToPremium}
              disabled={!selectedPackage || globalIsLoading}
            />
            <CustomButton
              title="Restore Purchases"
              mode="text"
              onPress={handleRestorePurchases}
            />
          </View>

          <View style={styles.legalLinksContainer}>
            <Text style={styles.legalText}>
              By continuing, you acknowledge that your subscription will
              auto-renew unless canceled. You can manage your subscription in
              your App Store settings. For more details, please review our{" "}
              <Text
                style={styles.legalLink}
                onPress={() => router.push("/terms-of-service")}
              >
                Terms of Service
              </Text>{" "}
              and{" "}
              <Text
                style={styles.legalLink}
                onPress={() => router.push("/privacy-policy")}
              >
                Privacy Policy
              </Text>
              .
            </Text>
          </View>
        </>
      ) : (
        <View style={styles.unavailableContainer}>
          <MaterialCommunityIcons
            name="cloud-off-outline"
            size={48}
            color={theme.colors.onSurfaceVariant}
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.unavailableText}>
            Subscription options are currently unavailable. Please check your
            internet connection and try again later.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
