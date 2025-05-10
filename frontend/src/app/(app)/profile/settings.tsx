import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Button, List, Switch, Divider, Card } from "react-native-paper";
import { router } from "expo-router";
import { createTheme } from "@src/styles/theme";
import { useIsDarkMode } from "@stores/useThemeStore";
import useThemeStore from "@stores/useThemeStore";
import { useAuth } from "@hooks/useAuth";
import { useRevenueCat } from "@hooks/useRevenueCat";

export default function SettingsScreen() {
  const isDarkMode = useIsDarkMode();
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const theme = createTheme(isDarkMode);
  const { deleteAccount } = useAuth();
  const { showManageSubscriptions, isPremium } = useRevenueCat();

  return (
    <ScrollView style={styles.container}>
      <Card style={[styles.card, { backgroundColor: theme.colors.background }]}>
        <List.Section>
          <List.Subheader>Appearance</List.Subheader>
          <List.Item
            title="Dark Mode"
            description="Toggle between light and dark theme"
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                color={theme.colors.primary}
              />
            )}
          />

          <Divider />

          <List.Subheader>Notifications</List.Subheader>
          <List.Item
            title="Push Notifications"
            description="Receive push notifications"
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={true}
                onValueChange={() => {}}
                color={theme.colors.primary}
              />
            )}
          />

          <List.Item
            title="Email Notifications"
            description="Receive email notifications"
            left={(props) => <List.Icon {...props} icon="email" />}
            right={() => (
              <Switch
                value={true}
                onValueChange={() => {}}
                color={theme.colors.primary}
              />
            )}
          />

          <Divider />

          <List.Subheader>Subscription</List.Subheader>
          <List.Item
            title="Manage Subscription"
            description={
              isPremium
                ? "View, change, or cancel your subscription"
                : "Subscribe to premium to unlock this feature"
            }
            left={(props) => <List.Icon {...props} icon="star" />}
            onPress={() => showManageSubscriptions()}
            disabled={!isPremium}
          />
        </List.Section>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    marginBottom: 20,
  },
  buttonGroup: {
    marginTop: 8,
  },
  dangerButton: {
    marginVertical: 8,
    borderColor: "transparent",
  },
});
