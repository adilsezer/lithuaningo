import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useUserData } from "@stores/useUserStore";
import { useReminderSettings } from "@hooks/useReminderSettings";
import CustomButton from "@components/ui/CustomButton";
import BackButton from "@components/layout/BackButton";
import { ReminderSettings } from "@components/settings/ReminderSettings";
import CustomText from "@components/ui/CustomText";
const SettingsScreen: React.FC = () => {
  const userData = useUserData();
  const {
    reminderEnabled,
    setReminderEnabled,
    reminderTime,
    setReminderTime,
    saveSettings,
  } = useReminderSettings(userData?.id);

  return (
    <ScrollView>
      <BackButton />
      <CustomText>Settings</CustomText>

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
