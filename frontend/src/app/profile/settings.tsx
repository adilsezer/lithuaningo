import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useTheme, List, Divider } from "react-native-paper";
import { useRouter } from "expo-router";
import { useUserData, useIsPremium } from "@stores/useUserStore";
import { useReminderSettings } from "@hooks/useReminderSettings";
import CustomButton from "@components/ui/CustomButton";
import { ReminderSettings } from "@components/settings/ReminderSettings";
import HeaderWithBackButton from "@components/layout/HeaderWithBackButton";

const SettingsScreen: React.FC = () => {
  const userData = useUserData();
  const isPremium = useIsPremium();
  const router = useRouter();
  const theme = useTheme();
  const {
    reminderEnabled,
    setReminderEnabled,
    reminderTime,
    setReminderTime,
    saveSettings,
  } = useReminderSettings(userData?.id);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 16,
    },
    divider: {
      marginVertical: 16,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <HeaderWithBackButton title="Settings" />

      <List.Section>
        <List.Item
          title="Premium Features"
          description={
            isPremium
              ? "View your premium benefits"
              : "Upgrade to premium for unlimited access"
          }
          left={(props) => (
            <List.Icon {...props} icon="star" color={theme.colors.primary} />
          )}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => router.push("/premium/premium-features")}
        />
      </List.Section>

      <Divider style={styles.divider} />

      <ReminderSettings
        reminderEnabled={reminderEnabled}
        reminderTime={reminderTime}
        onToggleReminder={setReminderEnabled}
        onTimeChange={setReminderTime}
      />

      <CustomButton title="Save Settings" onPress={saveSettings} />
    </ScrollView>
  );
};

export default SettingsScreen;
