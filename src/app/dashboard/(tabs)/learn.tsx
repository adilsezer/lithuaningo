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
      <CustomButton
        title="Start Learning"
        onPress={handleStartLearning}
        style={globalStyles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#58CC02",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
});
