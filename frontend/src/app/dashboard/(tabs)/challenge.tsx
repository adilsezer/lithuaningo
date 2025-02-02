import React from "react";
import { ScrollView, Image, StyleSheet } from "react-native";
import CustomButton from "@components/ui/CustomButton";
import { router } from "expo-router";
import CustomText from "@components/ui/CustomText";
import Leaderboard from "@components/ui/Leaderboard";
import { useLeaderboard } from "@hooks/useLeaderboard";
import CustomDivider from "@components/ui/CustomDivider";
export default function LearnScreen() {
  const handleNavigation = (route: string) => {
    router.push(route);
  };

  const { entries, weekId, startDate, endDate } = useLeaderboard();

  return (
    <ScrollView>
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

      <CustomButton
        title="Start Daily Challenge"
        onPress={() => handleNavigation("/learning/quiz")}
      />
      <CustomDivider />
      <Leaderboard
        entries={entries}
        weekId={weekId}
        startDate={startDate}
        endDate={endDate}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: 300,
    marginVertical: 20,
  },
});
