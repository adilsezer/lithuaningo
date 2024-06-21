// src/components/CompletedScreen.tsx
import React from "react";
import { ScrollView, Text, View, StyleSheet } from "react-native";
import CustomButton from "./CustomButton";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // Ensure you have this package installed

interface CompletedScreenProps {
  displayText: string;
  buttonText: string;
  navigationRoute: string;
  totalQuestions?: number;
  correctAnswers?: number;
  wrongAnswers?: number;
}

const CompletedScreen: React.FC<CompletedScreenProps> = ({
  displayText,
  buttonText,
  navigationRoute,
  totalQuestions,
  correctAnswers,
  wrongAnswers,
}) => {
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const router = useRouter();

  return (
    <ScrollView>
      <Text style={[globalStyles.title, { marginTop: 40 }]}>{displayText}</Text>
      {(totalQuestions !== undefined ||
        correctAnswers !== undefined ||
        wrongAnswers !== undefined) && (
        <View style={styles.statsContainer}>
          {totalQuestions !== undefined && (
            <View style={styles.statItem}>
              <Ionicons
                name="help-circle-outline"
                size={24}
                color={globalColors.primary}
              />
              <Text style={styles.statText}>{totalQuestions}</Text>
              <Text style={globalStyles.text}>Total Questions</Text>
            </View>
          )}
          {correctAnswers !== undefined && (
            <View style={styles.statItem}>
              <Ionicons
                name="checkmark-circle-outline"
                size={24}
                color="green"
              />
              <Text style={[styles.statText]}>{correctAnswers}</Text>
              <Text style={globalStyles.text}>Correct Answers</Text>
            </View>
          )}
          {wrongAnswers !== undefined && (
            <View style={styles.statItem}>
              <Ionicons name="close-circle-outline" size={24} color="red" />
              <Text style={styles.statText}>{wrongAnswers}</Text>
              <Text style={globalStyles.text}>Wrong Answers</Text>
            </View>
          )}
        </View>
      )}
      <CustomButton
        title={buttonText}
        onPress={() => router.push(navigationRoute)}
        style={{
          backgroundColor: globalColors.secondary,
          marginTop: 20,
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statText: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 5,
  },
});

export default CompletedScreen;
