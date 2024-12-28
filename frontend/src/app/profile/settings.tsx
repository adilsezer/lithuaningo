import React, { useState, useEffect } from "react";
import { View, Switch, StyleSheet, Alert, ScrollView } from "react-native";
import { useAppSelector } from "@redux/hooks";
import { selectUserData } from "@redux/slices/userSlice";
import {
  cancelAllScheduledNotifications,
  scheduleDailyReviewReminder,
} from "@services/notification/notificationService";
import CustomButton from "@components/ui/CustomButton";
import { useThemeStyles } from "@hooks/useThemeStyles";
import BackButton from "@components/layout/BackButton";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { storeData, retrieveData } from "@utils/storageUtils";
import { NOTIFICATION_KEYS } from "@config/constants";
import { SectionTitle, Subtitle, SectionText } from "@components/typography";

const SettingsScreen: React.FC = () => {
  const userData = useAppSelector(selectUserData);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const { colors } = useThemeStyles();

  useEffect(() => {
    const loadSettings = async () => {
      const enabled = await retrieveData<boolean>(
        NOTIFICATION_KEYS.REMINDER_ENABLED
      );
      const time = await retrieveData<string>(NOTIFICATION_KEYS.REMINDER_TIME);

      setReminderEnabled(enabled === true);
      if (time) {
        setReminderTime(new Date(time));
      } else {
        setReminderTime(null);
      }
    };

    loadSettings();
  }, []);

  const handleToggleReminder = (value: boolean) => {
    setReminderEnabled(value);
  };

  const handleConfirm = (selectedTime: Date) => {
    const roundedTime = new Date(selectedTime);
    roundedTime.setSeconds(0, 0);
    setReminderTime(roundedTime);
    setDatePickerVisibility(false);
  };

  const saveSettings = async () => {
    await storeData(NOTIFICATION_KEYS.REMINDER_ENABLED, reminderEnabled);
    if (reminderTime) {
      await storeData(
        NOTIFICATION_KEYS.REMINDER_TIME,
        reminderTime.toISOString()
      );
    }
    if (reminderEnabled && userData?.id && reminderTime) {
      await scheduleDailyReviewReminder(userData.id, reminderTime);
    } else {
      await cancelAllScheduledNotifications();
    }
    Alert.alert(
      "Settings Saved",
      "Your settings have been successfully saved."
    );
  };

  return (
    <ScrollView>
      <BackButton />
      <View style={styles.container}>
        <SectionTitle>Settings</SectionTitle>

        <View style={styles.section}>
          <Subtitle>Daily Reminder</Subtitle>

          <View style={styles.setting}>
            <SectionText>Enable Daily Reminder</SectionText>
            <Switch
              value={reminderEnabled}
              onValueChange={handleToggleReminder}
            />
          </View>

          {reminderEnabled && reminderTime && (
            <View
              style={[styles.timeContainer, { backgroundColor: colors.card }]}
            >
              <SectionText contrast>Reminder Time</SectionText>
              <Subtitle contrast>
                {reminderTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Subtitle>
              <CustomButton
                title="Choose Another Time"
                onPress={() => setDatePickerVisibility(true)}
                style={{ backgroundColor: colors.secondary }}
              />
            </View>
          )}
        </View>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="time"
          onConfirm={handleConfirm}
          onCancel={() => setDatePickerVisibility(false)}
          isDarkModeEnabled={false}
          textColor="black"
        />

        <CustomButton
          title="Save Settings"
          onPress={saveSettings}
          style={styles.saveButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  section: {
    borderWidth: 0.2,
    borderRadius: 10,
    borderColor: "grey",
    paddingHorizontal: 20,
    paddingVertical: 30,
    marginVertical: 20,
  },
  setting: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 15,
  },
  timeContainer: {
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  saveButton: {
    marginTop: 20,
  },
});

export default SettingsScreen;
