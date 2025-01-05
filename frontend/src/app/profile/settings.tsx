import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useAppSelector } from "@redux/hooks";
import { selectUserData } from "@redux/slices/userSlice";
import { useReminderSettings } from "@hooks/useReminderSettings";
import CustomButton from "@components/ui/CustomButton";
import BackButton from "@components/layout/BackButton";
import { SectionTitle } from "@components/typography";
import { ReminderSettings } from "@components/settings/ReminderSettings";

const SettingsScreen: React.FC = () => {
  const userData = useAppSelector(selectUserData);
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
      <SectionTitle>Settings</SectionTitle>

      <ReminderSettings
        reminderEnabled={reminderEnabled}
        reminderTime={reminderTime}
        onToggleReminder={setReminderEnabled}
        onTimeChange={setReminderTime}
      />

      <CustomButton
        title="Save Settings"
        onPress={saveSettings}
        style={styles.saveButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  saveButton: {
    marginTop: 20,
  },
});

export default SettingsScreen;
