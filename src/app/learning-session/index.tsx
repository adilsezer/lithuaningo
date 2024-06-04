import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
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
  const [isSubmitPressed, setIsSubmitPressed] = useState(false);
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
      setIsSubmitPressed(false); // Reset submit state for next card
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
        <Text
          style={[styles.congratulationsText, { color: globalColors.success }]}
        >
          Congratulations!
        </Text>
        <Text style={globalStyles.subtitle}>
          You have completed all the cards.
        </Text>
      </View>
    );
  }

  const renderCard = (card: LearningCard) => {
    switch (card.type) {
      case "multiple_choice":
        return (
          <MultipleChoiceCard
            card={card}
            onOptionSelect={() => setIsSubmitPressed(true)}
          />
        );
      case "fill_in_the_blank":
        return (
          <FillInTheBlankCard
            card={card}
            onSubmit={() => setIsSubmitPressed(true)}
            isSubmitPressed={isSubmitPressed}
          />
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <BackButton />
        <View style={styles.topSection}>
          <Text style={globalStyles.text}>
            Completed {currentCardIndex + 1}/{cards.length} Cards
          </Text>
        </View>
        {isSubmitPressed && (
          <CustomButton
            title="Continue"
            onPress={handleNextCard}
            style={{
              backgroundColor: globalColors.secondary,
            }}
          />
        )}
        <View style={styles.middleSection}>
          {renderCard(cards[currentCardIndex])}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "space-between",
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
    textAlign: "center",
    marginVertical: 20,
  },
});

export default LearningSessionScreen;
