import React from "react";
import { ScrollView, Image, StyleSheet } from "react-native";
import CustomButton from "@components/ui/CustomButton";
import { router } from "expo-router";
import CustomText from "@components/ui/CustomText";
import Leaderboard from "@components/ui/Leaderboard";
import { useLeaderboard } from "@hooks/useLeaderboard";
import { useUserData } from "@stores/useUserStore";
import { UserChallengeStatsCard } from "@components/challenge/UserChallengeStatsCard";
import CustomDivider from "@components/ui/CustomDivider";
import { ErrorMessage } from "@components/ui/ErrorMessage";
import { useUserChallengeStats } from "@src/hooks/useUserChallengeStats";

export default function LearnScreen() {
  const handleNavigation = (route: string) => {
    router.push(route);
  };

  const userData = useUserData();
  const {
    entries,
    loading,
    error: leaderboardError,
    fetchLeaderboard,
  } = useLeaderboard();
  const { stats, error, isLoading } = useUserChallengeStats(userData?.id);

  React.useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={require("assets/images/learn_screen.png")}
        style={styles.image}
        resizeMode="contain"
      />
      <CustomText variant="titleLarge" bold>
        Daily Challenge
      </CustomText>
      <CustomText>
        Ready for today's Lithuaningo challenge? Test your skills with a daily
        quiz or warm up with flashcards.
      </CustomText>

      {stats && <UserChallengeStatsCard stats={stats} />}

      <CustomButton
        title="Start Daily Challenge"
        onPress={() => handleNavigation("/learning/quiz")}
      />
      <CustomDivider />
      <Leaderboard entries={entries} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  image: {
    width: "100%",
    height: 300,
    marginVertical: 20,
  },
});
