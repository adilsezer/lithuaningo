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
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();

  useEffect(() => {
    const loadSettings = async () => {
      const enabled = await AsyncStorage.getItem(REMINDER_ENABLED_KEY);
      const time = await AsyncStorage.getItem(REMINDER_TIME_KEY);

      setReminderEnabled(enabled === "true");
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
      <Text style={[globalStyles.title, styles.title]}>Settings</Text>
      <View style={styles.dailyReminder}>
        <Text style={[globalStyles.subheading, styles.subheading]}>
          Daily Reminder
        </Text>
        <View style={styles.setting}>
          <Text style={globalStyles.subtitle}>Enable Daily Reminder</Text>
          <Switch
            value={reminderEnabled}
            onValueChange={handleToggleReminder}
          />
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
              <View
                style={[
                  styles.timeContainer,
                  { backgroundColor: globalColors.card },
                ]}
              >
                <Text
                  style={[
                    globalStyles.subtitle,
                    { color: globalColors.cardText },
                  ]}
                >
                  Reminder Time
                </Text>
                <Text
                  style={[
                    globalStyles.subheading,
                    { color: globalColors.cardText },
                  ]}
                >
                  {reminderTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    marginBottom: 20,
  },
  subheading: {
    marginBottom: 20,
  },
  dailyReminder: {
    borderWidth: 0.2,
    borderRadius: 10,
    borderColor: "grey",
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  setting: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  buttonContainer: {
    alignItems: "flex-end",
  },
  timeContainer: {
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
});

export default SettingsScreen;
