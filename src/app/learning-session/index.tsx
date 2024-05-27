// screens/LearningSessionScreen.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import BackButton from "@components/BackButton";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import MultipleChoiceCard from "@components/MultipleChoiceCard";
import FillInTheBlankCard from "@components/FillInTheBlankCard";
import TrueFalseCard from "@components/TrueFalseCard";
import CustomButton from "@components/CustomButton";
import useFetchData from "@src/hooks/useFetchData";
import { LearningCard } from "@src/services/FirebaseDataService";
import { useAppSelector } from "@src/redux/hooks";
import { selectUserData } from "@src/redux/slices/userSlice";

const LearningSessionScreen: React.FC = () => {
  const { cards } = useFetchData();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const userData = useAppSelector(selectUserData);

  const renderCard = (card: LearningCard) => {
    switch (card.type) {
      case "multiple_choice":
        return <MultipleChoiceCard card={card} userId={userData?.id || ""} />;
      case "fill_in_the_blank":
        return <FillInTheBlankCard card={card} />;
      case "true_false":
        return <TrueFalseCard card={card} />;
      default:
        return null;
    }
  };

  const handleNextCard = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setSessionCompleted(true);
    }
  };

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
      <View style={styles.bottomSection}>
        <CustomButton
          title="Continue"
          onPress={handleNextCard}
          style={{
            backgroundColor: globalColors.secondary,
            paddingVertical: 14,
          }}
        />
      </View>
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
    flex: 10,
  },
  bottomSection: {
    justifyContent: "flex-end",
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
