import React from "react";
import { ScrollView, View, StyleSheet, useColorScheme } from "react-native";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { useAppSelector } from "@redux/hooks";
import { selectUserData } from "@redux/slices/userSlice";
import CustomButton from "@components/ui/CustomButton";
import { router } from "expo-router";
import useAnnouncements from "@hooks/useAnnouncements";
import { useUserStats } from "@hooks/useUserStats";
import { SectionTitle, SectionText } from "@components/typography";
import Divider from "@components/ui/Divider";
import { useTheme } from "@src/context/ThemeContext";
import { AnnouncementsCard } from "@components/dashboard/AnnouncementsCard";
import { LearningProgressCard } from "@components/dashboard/LearningProgressCard";
import { WordOfTheDayCard } from "@components/dashboard/WordOfTheDayCard";

const DashboardScreen: React.FC = () => {
  const { colors } = useThemeStyles();
  const userData = useAppSelector(selectUserData);
  const announcements = useAnnouncements();
  const { todayAnsweredQuestions, todayCorrectAnsweredQuestions } =
    useUserStats();
  const { isDarkMode } = useTheme();

  const validAnnouncements = announcements.filter((a) => a.title && a.content);

  return (
    <ScrollView>
      <View style={styles.container}>
        <SectionTitle>Hi, {userData?.name || "there"}!</SectionTitle>

        {validAnnouncements.length > 0 && (
          <AnnouncementsCard
            announcements={validAnnouncements}
            backgroundColor={colors.secondary}
          />
        )}
        <LearningProgressCard
          answeredQuestions={todayAnsweredQuestions}
          correctAnswers={todayCorrectAnsweredQuestions}
          colors={colors}
        />
        <WordOfTheDayCard
          word="Labas"
          loading={false}
          partOfSpeech="Interjection"
          ipa="[ˈlɑbɑs]"
          englishTranslation="Hello"
          sentenceUsage="Labas, as irgi!"
          isDarkMode={isDarkMode}
          backgroundColor={colors.secondary}
        />

        <Divider style={{ marginVertical: 16 }} />

        <SectionText>Want to learn more?</SectionText>
        <CustomButton
          title="Start Learning"
          onPress={() => router.push("/dashboard/learn")}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
});

export default DashboardScreen;
