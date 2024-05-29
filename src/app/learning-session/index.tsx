// src/app/learning-session/index.tsx

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import BackButton from "@components/BackButton";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import MultipleChoiceCard from "@components/MultipleChoiceCard";
import FillInTheBlankCard from "@components/FillInTheBlankCard";
import CustomButton from "@components/CustomButton";
import useStats from "@src/hooks/useStats";
import {
  LearningCard,
  checkIfCompletedToday,
  updateCompletionDate,
} from "@src/services/FirebaseDataService";
import { useAppSelector } from "@src/redux/hooks";
import { selectUserData } from "@src/redux/slices/userSlice";

const LearningSessionScreen: React.FC = () => {
  const { cards, loading } = useStats();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const [canCompleteToday, setCanCompleteToday] = useState(true);
  const userData = useAppSelector(selectUserData);

  useEffect(() => {
    if (userData?.id) {
      const checkCompletionStatus = async () => {
        const completedToday = await checkIfCompletedToday(userData.id);
        setCanCompleteToday(!completedToday);
      };
      checkCompletionStatus();
    }
  }, [userData]);

  const handleNextCard = async () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setSessionCompleted(true);
      if (userData?.id) {
        await updateCompletionDate(userData.id);
      }
    }
  };

  if (loading) {
    return (
      <View style={globalStyles.layoutContainer}>
        <Text style={globalStyles.subtitle}>Loading...</Text>
      </View>
    );
  }

  if (!canCompleteToday) {
    return (
      <View style={globalStyles.layoutContainer}>
        <BackButton />
        <Text style={globalStyles.subtitle}>
          You have completed all the cards for today. Please come back tomorrow.
        </Text>
      </View>
    );
  }

  if (cards.length === 0) {
    return (
      <View style={globalStyles.layoutContainer}>
        <BackButton />
        <Text style={globalStyles.subtitle}>
          No cards available at the moment. Please come back tomorrow.
        </Text>
      </View>
    );
  }

  if (sessionCompleted) {
    return (
      <View style={globalStyles.layoutContainer}>
        <BackButton />
        <Text style={styles.congratulationsText}>Congratulations!</Text>
        <Text style={globalStyles.subtitle}>
          You have completed all the cards.
        </Text>
      </View>
    );
  }

  const renderCard = (card: LearningCard) => {
    switch (card.type) {
      case "multiple_choice":
        return <MultipleChoiceCard card={card} />;
      case "fill_in_the_blank":
        return <FillInTheBlankCard card={card} />;
      default:
        return null;
    }
  };

  return (
    <View style={[globalStyles.layoutContainer, styles.container]}>
      <BackButton />
      <View style={styles.topSection}>
        <Text style={globalStyles.subtitle}>
          Completed {currentCardIndex + 1}/{cards.length} Cards
        </Text>
      </View>
      <View style={styles.middleSection}>
        {renderCard(cards[currentCardIndex])}
      </View>
      <CustomButton
        title="Continue"
        onPress={handleNextCard}
        style={{
          backgroundColor: globalColors.secondary,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    flex: 1,
    justifyContent: "flex-start",
  },
  middleSection: {
    flex: 14,
  },
  congratulationsText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
    textAlign: "center",
    marginVertical: 20,
  },
});

export default LearningSessionScreen;
