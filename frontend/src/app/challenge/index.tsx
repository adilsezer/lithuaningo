import React from "react";
import { View, StyleSheet } from "react-native";
import HeaderWithBackButton from "@components/layout/HeaderWithBackButton";
import { useChallenge } from "@src/hooks/useChallenge";
import ChallengeComponent from "@components/challenge/ChallengeComponent";

const ChallengeScreen: React.FC = () => {
  const {
    questions,
    currentIndex,
    currentQuestion,
    loading,
    error,
    score,
    isCorrectAnswer,
    isCompleted,
    fetchChallenge,
    handleAnswer,
    handleNextQuestion,
    resetChallenge,
    getCompletionMessage,
  } = useChallenge();

  return (
    <View style={styles.container}>
      <HeaderWithBackButton title="Challenge" />
      <ChallengeComponent
        questions={questions}
        currentIndex={currentIndex}
        currentQuestion={currentQuestion}
        loading={loading}
        error={error}
        score={score}
        isCorrectAnswer={isCorrectAnswer}
        isCompleted={isCompleted}
        onAnswer={handleAnswer}
        onNextQuestion={handleNextQuestion}
        onRetry={() => fetchChallenge()}
        onGenerateNew={() => fetchChallenge(true)}
        getCompletionMessage={getCompletionMessage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ChallengeScreen;
