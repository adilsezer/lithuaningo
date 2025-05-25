import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import CustomText from '@components/ui/CustomText';
import ChallengeComponent from '@components/ui/ChallengeComponent';
import ErrorMessage from '@components/ui/ErrorMessage';
import { useUserData } from '@stores/useUserStore';
import { useFlashcardChallenge } from '@hooks/useFlashcardChallenge';

export default function FlashcardChallengeScreen() {
  const theme = useTheme();
  const userData = useUserData();
  const { id: categoryId, name: categoryName } = useLocalSearchParams<{
    id: string;
    name: string;
  }>();

  const {
    isLoading,
    error,
    questions,
    currentQuestion,
    currentIndex,
    score,
    isCorrectAnswer,
    isCompleted,
    handleAnswer,
    handleNextQuestion,
    handleRetry,
  } = useFlashcardChallenge({
    categoryId,
    userId: userData?.id,
    categoryName,
  });

  const screenTitle = categoryName
    ? `${categoryName} Challenge`
    : 'Flashcard Challenge';

  // Handle redirect when no questions are available
  React.useEffect(() => {
    if (!isLoading && !error && (!questions || questions.length === 0)) {
      router.replace('/(app)/(tabs)/flashcard');
    }
  }, [isLoading, error, questions]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size='large' color={theme.colors.primary} />
        <CustomText style={styles.loadingText}>
          Preparing your {categoryName || 'Flashcard'} Challenge...
        </CustomText>
      </View>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={handleRetry}
        onSecondaryAction={() => router.replace('/(app)/(tabs)/flashcard')}
        secondaryButtonText='Back to Categories'
        fullScreen
      />
    );
  }

  if (!questions || questions.length === 0) {
    // If no questions and no error, the hook has already shown an alert
    // The useEffect above will handle the redirect
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size='large' color={theme.colors.primary} />
        <CustomText style={styles.loadingText}>Redirecting...</CustomText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ChallengeComponent
        title={screenTitle}
        questions={questions}
        currentIndex={currentIndex}
        currentQuestion={currentQuestion}
        loading={isLoading} // This will likely be false here, but good to pass
        error={null} // Error is handled above
        score={score}
        isCorrectAnswer={isCorrectAnswer}
        isCompleted={isCompleted}
        onAnswer={handleAnswer}
        onNextQuestion={handleNextQuestion}
        onRetry={handleRetry}
        onGoBack={() => router.replace('/(app)/(tabs)/flashcard')}
        // customCompletionComponent can be added if needed
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
});
