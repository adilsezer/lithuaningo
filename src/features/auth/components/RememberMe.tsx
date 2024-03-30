import { useThemeStyles } from "@src/hooks/useThemeStyles";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const RememberMe = () => {
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();

  const [isChecked, setIsChecked] = useState(false);

  const toggleCheckbox = () => {
    setIsChecked(!isChecked);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleCheckbox} style={styles.checkbox}>
        <Text style={styles.checkboxText}>{isChecked ? "✓" : ""}</Text>
      </TouchableOpacity>
      <Text style={globalStyles.text}>Remember Me</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    height: 20,
    width: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#999",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxText: {
    fontWeight: "bold",
  },
});

export default RememberMe;
