// components/StatusLabel.tsx
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";

interface StatusLabelProps {
  label: string;
  style?: ViewStyle;
}

const StatusLabel: React.FC<StatusLabelProps> = ({ label, style }) => {
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: globalColors.primary },
        style,
      ]}
    >
      <Text
        style={[
          globalStyles.text,
          { color: globalColors.text, fontFamily: "Roboto-Bold" },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 200,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 10,
  },
});

export default StatusLabel;
