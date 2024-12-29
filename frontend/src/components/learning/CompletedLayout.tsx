import React, { useEffect, useState } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import CustomButton from "@components/ui/CustomButton";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUserProfile } from "@hooks/useUserProfile";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { SectionTitle, Subtitle, SectionText } from "@components/typography";

interface CompletedLayoutProps {
  title: string;
  subtitle: string;
  buttonText: string;
  navigationRoute: string;
  showStats: boolean;
}

const CompletedLayout: React.FC<CompletedLayoutProps> = ({
  title,
  subtitle,
  buttonText,
  navigationRoute,
  showStats,
}) => {
  const { colors } = useThemeStyles();
  const router = useRouter();
  const { profile } = useUserProfile();
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  function calculateTimeRemaining() {
    const now = new Date();
    const nextReset = new Date();
    nextReset.setUTCHours(2, 0, 0, 0);
    if (now >= nextReset) {
      nextReset.setUTCDate(nextReset.getUTCDate() + 1);
    }
    const timeDiff = nextReset.getTime() - now.getTime();
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    return { hours, minutes, seconds };
  }

  return (
    <ScrollView>
      <SectionTitle style={{ marginTop: 40 }}>{title}</SectionTitle>
      <Subtitle style={{ marginTop: 20 }}>{subtitle}</Subtitle>

      {showStats && (
        <View style={styles.statsContainer}>
          {profile?.todayAnsweredQuestions !== undefined && (
            <View style={styles.statItem}>
              <Ionicons
                name="help-circle-outline"
                size={24}
                color={colors.primary}
              />
              <SectionText style={styles.statText}>
                {profile?.todayAnsweredQuestions}
              </SectionText>
              <SectionText>Total Questions</SectionText>
            </View>
          )}

          {profile?.todayCorrectAnsweredQuestions !== undefined && (
            <View style={styles.statItem}>
              <Ionicons
                name="checkmark-circle-outline"
                size={24}
                color="green"
              />
              <SectionText style={styles.statText}>
                {profile?.todayCorrectAnsweredQuestions}
              </SectionText>
              <SectionText>Correct Answers</SectionText>
            </View>
          )}

          {profile?.todayAnsweredQuestions !== undefined &&
            profile?.todayCorrectAnsweredQuestions !== undefined && (
              <View style={styles.statItem}>
                <Ionicons name="close-circle-outline" size={24} color="red" />
                <SectionText style={styles.statText}>
                  {profile.todayAnsweredQuestions -
                    profile.todayCorrectAnsweredQuestions}
                </SectionText>
                <SectionText>Wrong Answers</SectionText>
              </View>
            )}
        </View>
      )}

      {showStats && (
        <View style={styles.timerContainer}>
          <Subtitle>Next challenge available in:</Subtitle>
          <SectionTitle>
            {`${timeRemaining.hours}h ${timeRemaining.minutes}m ${timeRemaining.seconds}s`}
          </SectionTitle>
        </View>
      )}

      <CustomButton
        title={buttonText}
        onPress={() => router.push(navigationRoute)}
        style={{
          backgroundColor: colors.primary,
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
  timerContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
});

export default CompletedLayout;
