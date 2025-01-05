import React from "react";
import { View, StyleSheet } from "react-native";
import { SectionText, Subtitle } from "@components/typography";
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

interface DailyChallengeCardProps {
  answeredQuestions: number;
  correctAnswers: number;
  colors: ThemeColors;
}

export const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({
  answeredQuestions,
  correctAnswers,
  colors,
}) => {
  const wrongAnswers = answeredQuestions - correctAnswers;

  return (
    <View>
      <Subtitle>Daily Challenge</Subtitle>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <SectionText style={[styles.subtitle, { color: colors.cardText }]}>
          Here is your progress for today.
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
          <StatItem
            label="Wrong Answers"
            value={wrongAnswers}
            colors={colors}
          />
        </View>
        <ProgressBar
          progress={answeredQuestions / 10}
          style={{ marginTop: 16 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 6,
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
    marginVertical: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  centered: {
    alignItems: "center",
    marginVertical: 4,
    flex: 1,
    paddingHorizontal: 4,
  },
});
