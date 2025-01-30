import CustomText from "@components/ui/CustomText";
import React from "react";
import { View, StyleProp, ViewStyle } from "react-native";
import { Switch, Text, useTheme } from "react-native-paper";

interface CustomSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label: string;
  error?: string;
  style?: StyleProp<ViewStyle>;
}

export default function CustomSwitch({
  value,
  onValueChange,
  label,
  error,
  style,
}: CustomSwitchProps) {
  const theme = useTheme();

  return (
    <View style={[{ marginVertical: 12 }, style]}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 16,
        }}
      >
        <CustomText variant="bodyLarge">{label}</CustomText>
        <Switch
          value={value}
          onValueChange={onValueChange}
          color={theme.colors.primary}
        />
      </View>
      {error && (
        <Text
          variant="bodySmall"
          style={{ color: theme.colors.error, marginTop: 4 }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
