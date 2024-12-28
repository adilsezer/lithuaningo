import React, { useState } from "react";
import { View, Switch } from "react-native";
import { useThemeStyles } from "@hooks/useThemeStyles";
import CustomButton from "@components/ui/CustomButton";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Subtitle, SectionText } from "@components/typography";
import { StyleSheet } from "react-native";

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
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const { colors } = useThemeStyles();

  const handleConfirm = (selectedTime: Date) => {
    const roundedTime = new Date(selectedTime);
    roundedTime.setSeconds(0, 0);
    onTimeChange(roundedTime);
    setDatePickerVisibility(false);
  };

  return (
    <View style={styles.section}>
      <Subtitle>Daily Reminder</Subtitle>

      <View style={styles.setting}>
        <SectionText>Enable Daily Reminder</SectionText>
        <Switch value={reminderEnabled} onValueChange={onToggleReminder} />
      </View>

      {reminderEnabled && reminderTime && (
        <View style={[styles.timeContainer, { backgroundColor: colors.card }]}>
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

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="time"
        onConfirm={handleConfirm}
        onCancel={() => setDatePickerVisibility(false)}
        isDarkModeEnabled={false}
        textColor="black"
      />
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
});
