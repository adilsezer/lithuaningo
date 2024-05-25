import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import {
  fetchLearningCards,
  LearningCard,
} from "../../services/FirebaseDataService";
import BackButton from "@components/BackButton";
import { useAppDispatch } from "@src/redux/hooks";
import { setLoading } from "@src/redux/slices/uiSlice";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import MultipleChoiceCard from "@components/MultipleChoiceCard";
import FillInTheBlankCard from "@components/FillInTheBlankCard";
import TrueFalseCard from "@components/TrueFalseCard";
import CustomButton from "@components/CustomButton";

const LearningSessionScreen: React.FC = () => {
  const [cards, setCards] = useState<LearningCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const dispatch = useAppDispatch();
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();

  useEffect(() => {
    const loadCards = async () => {
      try {
        dispatch(setLoading(true));
        const fetchedCards = await fetchLearningCards();
        setCards(fetchedCards);
      } catch (err) {
        if (err instanceof Error) {
          Alert.alert("Error", err.message);
        } else {
          Alert.alert("Error", "An unknown error occurred");
        }
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadCards();
  }, [dispatch]);

  const renderCard = (card: LearningCard) => {
    switch (card.type) {
      case "multiple_choice":
        return <MultipleChoiceCard card={card} />;
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
