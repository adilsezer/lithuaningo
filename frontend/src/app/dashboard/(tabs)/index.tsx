import React from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { useThemeStyles } from "@hooks/useThemeStyles";
import CustomButton from "@components/ui/CustomButton";
import { router } from "expo-router";
import { SectionTitle } from "@components/typography";
import { AnnouncementsCard } from "@components/dashboard/AnnouncementsCard";
import { DailyChallengeCard } from "@components/dashboard/DailyChallengeCard";
import { ExpandYourVocabularyCard } from "@components/dashboard/ExpandYourVocabularyCard";
import { useDashboard } from "@hooks/useDashboard";
import { ErrorMessage } from "@components/ui/ErrorMessage";

const DashboardScreen: React.FC = () => {
  const { colors } = useThemeStyles();
  const {
    userData,
    validAnnouncements,
    profile,
    isDarkMode,
    wordsData,
    isLoading,
    error,
    clearError,
    fetchDashboardData,
  } = useDashboard();

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => {
          clearError();
          fetchDashboardData();
        }}
        fullScreen
      />
    );
  }

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
