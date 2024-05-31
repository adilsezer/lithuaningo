import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import CustomButton from "@components/CustomButton";
import { useThemeStyles } from "@src/hooks/useThemeStyles";

export default function Tab() {
  const handleStartLearning = () => {
    console.log("Start learning pressed!");
    router.push("/learning-session");
  };
  const { styles: globalStyles } = useThemeStyles();

  return (
    <View style={styles.container}>
      <Text style={globalStyles.title}>Ready to start learning?</Text>
      <CustomButton title="Start Learning" onPress={handleStartLearning} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  label: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});
