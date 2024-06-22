// src/components/CompletedScreen.tsx
import React from "react";
import { ScrollView, Text, View, StyleSheet } from "react-native";
import CustomButton from "./CustomButton";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // Ensure you have this package installed
import useData from "@src/hooks/useData";

interface CompletedScreenProps {
  displayText: string;
  buttonText: string;
  navigationRoute: string;
  showStats: boolean;
}

const CompletedScreen: React.FC<CompletedScreenProps> = ({
  displayText,
  buttonText,
  navigationRoute,
  showStats,
}) => {
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const router = useRouter();
  const { stats } = useData();

  return (
    <ScrollView>
      <Text style={[globalStyles.title, { marginTop: 40 }]}>{displayText}</Text>
      {showStats && (
        <View style={styles.statsContainer}>
          {stats?.todayAnsweredQuestions !== undefined && (
            <View style={styles.statItem}>
              <Ionicons
                name="help-circle-outline"
                size={24}
                color={globalColors.primary}
              />
              <Text style={styles.statText}>
                {stats.todayAnsweredQuestions}
              </Text>
              <Text style={globalStyles.text}>Total Questions</Text>
            </View>
          )}
          {stats?.todayCorrectAnsweredQuestions !== undefined && (
            <View style={styles.statItem}>
              <Ionicons
                name="checkmark-circle-outline"
                size={24}
                color="green"
              />
              <Text style={[styles.statText]}>
                {stats?.todayCorrectAnsweredQuestions}
              </Text>
              <Text style={globalStyles.text}>Correct Answers</Text>
            </View>
          )}
          {stats?.todayWrongAnsweredQuestions !== undefined && (
            <View style={styles.statItem}>
              <Ionicons name="close-circle-outline" size={24} color="red" />
              <Text style={styles.statText}>
                {stats?.todayWrongAnsweredQuestions}
              </Text>
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
