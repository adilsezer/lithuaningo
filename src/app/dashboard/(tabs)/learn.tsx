import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import CustomButton from "@components/CustomButton";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import { useAppDispatch } from "@src/redux/hooks";
import { resetClickedWords } from "@src/redux/slices/clickedWordsSlice";

export default function Tab() {
  const dispatch = useAppDispatch();
  const handleStartLearning = () => {
    dispatch(resetClickedWords());
    router.push("/learning-session");
  };
  const { styles: globalStyles } = useThemeStyles();

  return (
    <View style={styles.container}>
      <Text style={globalStyles.title}>Start Reviewing Today's Words</Text>
      <CustomButton title="Start" onPress={handleStartLearning} />
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
