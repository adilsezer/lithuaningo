import React, { useEffect, useState } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { useAppSelector } from "@redux/hooks";
import { selectUserData } from "@redux/slices/userSlice";
import CustomButton from "@components/ui/CustomButton";
import { router } from "expo-router";
import useAnnouncements from "@hooks/useAnnouncements";
import { useUserProfile } from "@hooks/useUserProfile";
import { SectionTitle, SectionText } from "@components/typography";
import Divider from "@components/ui/Divider";
import { useTheme } from "@src/context/ThemeContext";
import { AnnouncementsCard } from "@components/dashboard/AnnouncementsCard";
import { LearningProgressCard } from "@components/dashboard/LearningProgressCard";
import { WordOfTheDayCard } from "@components/dashboard/WordOfTheDayCard";
import wordService from "@services/data/wordService";
import { WordOfTheDay } from "@src/types";

const DashboardScreen: React.FC = () => {
  const { colors } = useThemeStyles();
  const userData = useAppSelector(selectUserData);
  const announcements = useAnnouncements();
  const { profile } = useUserProfile();
  const { isDarkMode } = useTheme();
  const [wordsData, setWordsData] = useState<WordOfTheDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWords = async () => {
      setIsLoading(true);
      const words = await wordService.getRandomWords(5);
      setWordsData(words);
      setIsLoading(false);
    };

    fetchWords();
  }, []);

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
          answeredQuestions={profile?.todayAnsweredQuestions ?? 0}
          correctAnswers={profile?.todayCorrectAnsweredQuestions ?? 0}
          colors={colors}
        />

        <WordOfTheDayCard
          words={wordsData}
          loading={isLoading}
          isDarkMode={isDarkMode}
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
