import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Image, Animated } from "react-native";
import {
  useTheme,
  Card,
  Text,
  Surface,
  List,
  Divider,
} from "react-native-paper";
import { Stack } from "expo-router";
import { useRevenueCat } from "@hooks/useRevenueCat";
import CustomButton from "@components/ui/CustomButton";
import LoadingIndicator from "@components/ui/LoadingIndicator";
import { useAlertDialog } from "@hooks/useAlertDialog";
import { useIsLoading } from "@stores/useUIStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Feature list definition with icons
const FEATURES = [
  {
    icon: "robot" as const,
    text: "AI-Powered Language Coach Available 24/7",
    description:
      "Master Lithuanian faster with personalized guidance whenever you need it",
  },
  {
    icon: "cards" as const,
    text: "Unlimited Flashcards",
    description: "Build vocabulary and memorize phrases with no restrictions",
  },
  {
    icon: "check-decagram" as const,
    text: "100% Ad-Free Experience",
    description: "Focus on learning without any advertisements",
  },
  {
    icon: "headset" as const,
    text: "Priority Support",
    description: "Get faster assistance whenever you need help",
  },
];

// Comparison table data
const COMPARISON_DATA = [
  { feature: "AI chat sessions", free: "5/month", premium: "Unlimited" },
  { feature: "Flashcards", free: "Limited", premium: "Unlimited" },
  { feature: "Ad-free experience", free: false, premium: true },
  { feature: "Priority support", free: false, premium: true },
];

export default function PremiumFeaturesScreen() {
  const theme = useTheme();
  const { offerings, purchasePackage } = useRevenueCat();
  const globalIsLoading = useIsLoading();
  const alertDialog = useAlertDialog();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(
    "yearly"
  );

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
      paddingHorizontal: 20,
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
    },
    tableContainer: {
      borderRadius: 12,
      overflow: "hidden",
    },
    tableRow: {
      flexDirection: "row",
      backgroundColor: theme.colors.background,
    },
    tableHeader: {
      backgroundColor: theme.colors.surfaceVariant,
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
    priceRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    originalPrice: {
      fontSize: 13,
      textDecorationLine: "line-through",
      color: theme.colors.outline,
      marginRight: 8,
    },
    savings: {
      fontSize: 13,
      color: theme.colors.error,
      fontWeight: "bold",
    },
    infoSection: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.secondaryContainer,
      padding: 16,
      borderRadius: 12,
      marginBottom: 24,
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
      marginBottom: 40,
      marginTop: 8,
    },
  });

  const getPriceString = (packageType: string) => {
    return (
      offerings?.availablePackages.find(
        (pkg) => pkg.packageType === packageType.toUpperCase()
      )?.product?.priceString ||
      (packageType === "MONTHLY"
        ? "$4.99"
        : packageType === "ANNUAL"
        ? "$39.99"
        : "$99.99")
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
          ? "MONTHLY"
          : selectedPackage === "yearly"
          ? "ANNUAL"
          : "LIFETIME";

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

  if (globalIsLoading) {
    return <LoadingIndicator modal={false} />;
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
              <View style={styles.priceRow}>
                <Text style={styles.originalPrice}>$59.88</Text>
                <Text style={styles.packagePrice}>
                  {getPriceString("ANNUAL")} per year
                </Text>
              </View>
              <Text style={styles.savings}>Save 33% with annual plan</Text>
            </>
          ) : type === "lifetime" ? (
            <>
              <Text style={styles.packagePrice}>
                {getPriceString("LIFETIME")} one-time payment
              </Text>
              <Text style={styles.savings}>Best long-term value</Text>
            </>
          ) : (
            <Text style={styles.packagePrice}>
              {getPriceString("MONTHLY")} per month
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
      <Stack.Screen options={{ title: "Premium Membership" }} />

      <View style={styles.header}>
        <View style={styles.imageContainer}>
          <Image
            source={require("assets/images/premium_screen.jpeg")}
            style={styles.premiumImage}
            accessibilityLabel="Premium features illustration"
          />
        </View>
        <Text style={styles.title}>Elevate Your Lithuanian</Text>
        <View style={styles.valueTag}>
          <Text style={styles.valueTagText}>UNLOCK FULL ACCESS</Text>
        </View>
        <Text style={styles.subtitle}>
          Learn faster with our premium tools and reach fluency in less time
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Premium Advantages</Text>

      <List.Section style={{ marginTop: -8, marginBottom: 8 }}>
        {FEATURES.map((feature, index) => (
          <React.Fragment key={index}>
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
        <View style={styles.tableContainer}>
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
          {COMPARISON_DATA.map((item, index) => (
            <React.Fragment key={index}>
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

      <Text style={styles.sectionTitle}>Choose Your Membership</Text>
      <View style={styles.planContainer}>
        {renderPlanCard("monthly", "Monthly")}
        {renderPlanCard("yearly", "Annual", true)}
        {renderPlanCard("lifetime", "Lifetime")}
      </View>

      <Surface style={styles.infoSection} elevation={1}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MaterialCommunityIcons
            name="shield-check"
            size={24}
            color={theme.colors.onSecondaryContainer}
            style={styles.infoIcon}
          />
          <Text style={styles.infoText}>
            Easy to manage. Your subscription can be changed or canceled anytime
            through your app store settings.
          </Text>
        </View>
      </Surface>

      <View style={styles.buttonContainer}>
        <CustomButton
          title={`Start Premium ${
            selectedPackage === "monthly"
              ? "Monthly"
              : selectedPackage === "yearly"
              ? "Annual"
              : "Lifetime"
          }`}
          mode="contained"
          onPress={handleUpgradeToPremium}
          disabled={!selectedPackage}
        />
      </View>
    </ScrollView>
  );
}
