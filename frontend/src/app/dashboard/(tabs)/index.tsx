import React, { useEffect, useState } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { useAppSelector, useAppDispatch } from "@redux/hooks";
import { selectUserData } from "@redux/slices/userSlice";
import CustomButton from "@components/ui/CustomButton";
import { router } from "expo-router";
import useAnnouncements from "@hooks/useAnnouncements";
import { useUserProfile } from "@hooks/useUserProfile";
import { SectionTitle, SectionText } from "@components/typography";
import Divider from "@components/ui/Divider";
import { useTheme } from "@src/context/ThemeContext";
import { AnnouncementsCard } from "@components/dashboard/AnnouncementsCard";
import { DailyChallengeCard } from "@components/dashboard/DailyChallengeCard";
import { ExpandYourVocabularyCard } from "@components/dashboard/ExpandYourVocabularyCard";
import wordService from "@services/data/wordService";
import { DashboardWord } from "@src/types";
import { setLoading, selectIsLoading } from "@redux/slices/uiSlice";

const DashboardScreen: React.FC = () => {
  const { colors } = useThemeStyles();
  const userData = useAppSelector(selectUserData);
  const announcements = useAnnouncements();
  const { profile } = useUserProfile();
  const { isDarkMode } = useTheme();
  const [wordsData, setWordsData] = useState<DashboardWord[]>([]);
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsLoading);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(setLoading(true));
        const fetchWords = async () => {
          const words = await wordService.getRandomWords(5);
          setWordsData(words);
        };

        fetchWords();
      } catch (error) {
        // ... error handling ...
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchData();
  }, [dispatch]);

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

        <DailyChallengeCard
          answeredQuestions={profile?.todayAnsweredQuestions ?? 0}
          correctAnswers={profile?.todayCorrectAnsweredQuestions ?? 0}
          colors={colors}
        />
        <CustomButton
          title="Start Daily Challenge"
          onPress={() => router.push("/dashboard/challenge")}
        />

        <ExpandYourVocabularyCard
          words={wordsData}
          loading={isLoading}
          isDarkMode={isDarkMode}
        />
        <CustomButton
          title="Expand Your Vocabulary"
          onPress={() => router.push("/dashboard/decks")}
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
