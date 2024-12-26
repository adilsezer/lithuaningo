import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useThemeStyles } from "@hooks/useThemeStyles";

export default function OrSeparator() {
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();

  const dynamicLineStyle = { backgroundColor: globalColors.border };

  return (
    <View style={styles.separator}>
      <View style={[styles.line, dynamicLineStyle]} />
      <Text style={[styles.orText, globalStyles.text]}>Or</Text>
      <View style={[styles.line, dynamicLineStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  separator: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 10,
  },
  orText: {
    width: 50,
    textAlign: "center",
  },
  line: {
    flex: 1,
    height: 1,
  },
});
