import React, { useEffect } from "react";
import {
  View,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { Subtitle } from "@components/typography";
import { StyleSheet } from "react-native";
import { CustomDatePicker } from "@components/ui/CustomDatePicker";
import { CustomSwitch } from "@components/ui/CustomSwitch";

// Enable LayoutAnimation for Android
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface ReminderSettingsProps {
  reminderEnabled: boolean;
  reminderTime: Date | null;
  onToggleReminder: (value: boolean) => void;
  onTimeChange: (time: Date) => void;
}

export const ReminderSettings: React.FC<ReminderSettingsProps> = ({
  reminderEnabled,
  reminderTime,
  onToggleReminder,
  onTimeChange,
}) => {
  const { colors } = useThemeStyles();

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [reminderEnabled]);

  return (
    <View style={styles.section}>
      <Subtitle>Daily Reminder</Subtitle>

      <View style={styles.setting}>
        <CustomSwitch
          value={reminderEnabled}
          onValueChange={(value) => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut
            );
            onToggleReminder(value);
          }}
          label="Enable Daily Reminder"
        />
      </View>

      {reminderEnabled && (
        <Animated.View
          style={[styles.timeContainer, { backgroundColor: colors.card }]}
        >
          <CustomDatePicker
            value={reminderTime || new Date()}
            onChange={onTimeChange}
            label="Reminder Time"
            mode="time"
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    borderWidth: 0.2,
    borderRadius: 10,
    borderColor: "grey",
    paddingHorizontal: 20,
    paddingVertical: 30,
    marginVertical: 20,
  },
  setting: {
    marginVertical: 15,
  },
  timeContainer: {
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
    overflow: "hidden",
  },
});
