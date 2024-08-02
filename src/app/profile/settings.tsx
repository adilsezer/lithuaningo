import React, { useState, useEffect } from "react";
import { View, Text, Switch, StyleSheet, Alert } from "react-native";
import { useAppSelector } from "@src/redux/hooks";
import { selectUserData } from "@src/redux/slices/userSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  cancelAllScheduledNotifications,
  scheduleDailyReviewReminder,
} from "@services/notification/notificationService";
import CustomButton from "@components/CustomButton";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import BackButton from "@components/BackButton";
import DateTimePickerModal from "react-native-modal-datetime-picker";

const REMINDER_ENABLED_KEY = "reminderEnabled";
const REMINDER_TIME_KEY = "reminderTime";

const SettingsScreen: React.FC = () => {
  const userData = useAppSelector(selectUserData);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const { styles: globalStyles } = useThemeStyles();

  useEffect(() => {
    const loadSettings = async () => {
      const enabled = await AsyncStorage.getItem(REMINDER_ENABLED_KEY);
      const time = await AsyncStorage.getItem(REMINDER_TIME_KEY);

      setReminderEnabled(enabled === "true");
      if (time) {
        setReminderTime(new Date(time));
      } else {
        // If no time is set, use the current reminderTime
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
    await AsyncStorage.setItem(
      REMINDER_ENABLED_KEY,
      reminderEnabled.toString()
    );
    if (reminderTime) {
      await AsyncStorage.setItem(REMINDER_TIME_KEY, reminderTime.toISOString());
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
    <View>
      <BackButton />
      <Text style={[globalStyles.title, { marginBottom: 40 }]}>
        Daily Reminder Settings
      </Text>
      <View style={styles.setting}>
        <Text style={globalStyles.subtitle}>Enable Daily Reminder</Text>
        <Switch value={reminderEnabled} onValueChange={handleToggleReminder} />
      </View>
      {reminderEnabled && (
        <>
          <View style={styles.setting}>
            <Text style={globalStyles.subtitle}>Set Reminder Time</Text>
            <View style={styles.buttonContainer}>
              <CustomButton
                title="Choose Time"
                onPress={() => setDatePickerVisibility(true)}
              />
            </View>
          </View>
          {reminderTime && (
            <Text style={globalStyles.bold}>
              Selected Time:{" "}
              {reminderTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
            </Text>
          )}
        </>
      )}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="time"
        onConfirm={handleConfirm}
        onCancel={() => setDatePickerVisibility(false)}
        isDarkModeEnabled={false}
      />
      <CustomButton title="Save Settings" onPress={saveSettings} />
    </View>
  );
};

const styles = StyleSheet.create({
  setting: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    alignItems: "flex-end",
  },
});

export default SettingsScreen;
