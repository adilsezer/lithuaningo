import React from "react";
import { View, StyleSheet } from "react-native";
import { SectionText } from "@components/typography";
import ProgressBar from "@components/ui/ProgressBar";
import { ThemeColors } from "@src/styles/colors";

interface StatItemProps {
  label: string;
  value: number;
  colors: ThemeColors;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, colors }) => (
  <View style={styles.centered}>
    <SectionText style={[styles.wordTitle, { color: colors.cardText }]}>
      {value}
    </SectionText>
    <SectionText style={[styles.subtitle, { color: colors.cardText }]}>
      {label}
    </SectionText>
  </View>
);

interface LearningProgressCardProps {
  answeredQuestions: number;
  correctAnswers: number;
  colors: ThemeColors;
}

export const LearningProgressCard: React.FC<LearningProgressCardProps> = ({
  answeredQuestions,
  correctAnswers,
  colors,
}) => (
  <View style={[styles.card, { backgroundColor: colors.card }]}>
    <SectionText style={[styles.cardTitle, { color: colors.cardText }]}>
      Daily Learning Progress
    </SectionText>
    <SectionText style={[styles.subtitle, { color: colors.cardText }]}>
      Track your daily progress. Answer 10 questions today!
    </SectionText>
    <View style={styles.row}>
      <StatItem
        label="Questions Answered"
        value={answeredQuestions}
        colors={colors}
      />
      <StatItem
        label="Correct Answers"
        value={correctAnswers}
        colors={colors}
      />
    </View>
    <ProgressBar progress={answeredQuestions / 10} style={{ marginTop: 16 }} />
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 16,
    marginTop: 10,
    borderWidth: 0.2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  wordTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginVertical: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  centered: {
    alignItems: "center",
    marginVertical: 4,
  },
});
