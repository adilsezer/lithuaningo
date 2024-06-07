import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import BackButton from "@components/BackButton";
import Flashcard from "@components/Flashcard";
import MultipleChoiceCard from "@components/MultipleChoiceCard";
import FillInTheBlankCard from "@components/FillInTheBlankCard";
import CustomButton from "@components/CustomButton";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import {
  FirebaseDataService,
  LearningCard,
} from "@src/services/FirebaseDataService";
import { useAppSelector } from "@src/redux/hooks";
import { selectUserData } from "@src/redux/slices/userSlice";
import { storeData, retrieveData, clearData } from "@src/utils/storageUtil";

const LearningSessionScreen: React.FC = () => {
  const [learningCards, setLearningCards] = useState<LearningCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [learnedCards, setLearnedCards] = useState<string[]>([]);
  const userData = useAppSelector(selectUserData);
  const userId = userData?.id || "";
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const [isSubmitPressed, setIsSubmitPressed] = useState(false);
  const [flashcardsCompleted, setFlashcardsCompleted] = useState(false);
  const cardsPerDay = 10;
  const COMPLETED_SESSION_INDEX = -1; // Special value to indicate completion

  const updateStorage = async (
    flashcardsCompleted: boolean,
    currentCardIndex: number
  ) => {
    const today = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format
    await storeData(`dailyCards_${userId}`, {
      date: today,
      cards: learningCards,
      flashcardsCompleted,
      currentCardIndex,
    });
  };

  useEffect(() => {
    const fetchDailyCards = async () => {
      try {
        const today = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format
        const storedData = await retrieveData<{
          date: string;
          cards: LearningCard[];
          flashcardsCompleted: boolean;
          currentCardIndex: number;
        }>(`dailyCards_${userId}`);
        if (
          storedData &&
          storedData.date === today &&
          storedData.cards.length > 0
        ) {
          setLearningCards(storedData.cards);
          setFlashcardsCompleted(storedData.flashcardsCompleted);
          setCurrentCardIndex(storedData.currentCardIndex);
        } else {
          if (storedData) {
            // Clear previous day's data if it exists
            await clearData(`dailyCards_${userId}`);
          }
          const cards = await FirebaseDataService.fetchLearningCards(userId);
          if (cards.length > 0) {
            const dailyCards = cards.slice(0, cardsPerDay);
            setLearningCards(dailyCards);
            await updateStorage(false, 0); // Initially, flashcards are not completed and start at the first card
          } else {
            console.log("No cards fetched");
          }
        }

        const completionStatus =
          await FirebaseDataService.checkIfCompletedToday(userId);
        if (completionStatus) {
          setFlashcardsCompleted(true); // If already completed, set flashcards as completed
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchDailyCards();
  }, [userId]);

  const handleMastered = async (cardId: string) => {
    setLearnedCards((prev) => [...prev, cardId]);
    await goToNextCard();
  };

  const handleReviewAgain = async (cardId: string) => {
    await putCardAtEnd(cardId);
  };

  const putCardAtEnd = async (cardId: string) => {
    setLearningCards((prev) => {
      const cardToMove = prev.find((card) => card.id === cardId);
      if (cardToMove) {
        const updatedCards = [
          ...prev.filter((card) => card.id !== cardId),
          cardToMove,
        ];
        return updatedCards;
      }
      return prev;
    });
    await updateStorage(flashcardsCompleted, currentCardIndex);
  };

  const goToNextCard = async () => {
    setCurrentCardIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      if (nextIndex >= learningCards.length) {
        setFlashcardsCompleted(true);
        setCurrentCardIndex(COMPLETED_SESSION_INDEX); // Set to special value indicating completion
        updateStorage(true, COMPLETED_SESSION_INDEX); // Update the storage to indicate flashcards are completed
      } else {
        updateStorage(false, nextIndex); // Update the storage with the progress and next card index
      }
      return nextIndex;
    });
  };

  const saveLearnedCards = async () => {
    try {
      await FirebaseDataService.updateUserLearnedCards(userId, learnedCards);
    } catch (error) {
      console.error("Error updating learned cards:", error);
    }
  };

  useEffect(() => {
    if (flashcardsCompleted) {
      saveLearnedCards();
    }
  }, [flashcardsCompleted]);

  const handleNextCard = async () => {
    if (currentCardIndex < learningCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsSubmitPressed(false);
      await updateStorage(flashcardsCompleted, currentCardIndex + 1); // Update storage with progress and next card index
    } else {
      setCurrentCardIndex(COMPLETED_SESSION_INDEX); // All cards completed
      if (userData?.id) {
        await FirebaseDataService.updateCompletionDate(userData.id);
      }
      await updateStorage(flashcardsCompleted, COMPLETED_SESSION_INDEX); // Update storage to indicate session completion
    }
  };

  const renderCard = (card: LearningCard | undefined) => {
    if (!card) {
      console.log("Card is undefined");
      return <Text>No card to display</Text>;
    }

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
        return <Text>Unknown card type</Text>;
    }
  };

  if (currentCardIndex === COMPLETED_SESSION_INDEX) {
    return (
      <ScrollView>
        <BackButton />
        <Text>You have completed today's session!</Text>
      </ScrollView>
    );
  }

  if (learningCards.length === 0) {
    return (
      <ScrollView>
        <BackButton />
        <Text>
          No new cards available. You have mastered all the available cards.
          Please come back tomorrow for more learning!
        </Text>
      </ScrollView>
    );
  }

  if (flashcardsCompleted) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <BackButton />
          <View style={styles.topSection}>
            <Text style={globalStyles.text}>
              Completed all flashcards. Now continue with additional cards.
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
            {renderCard(learningCards[currentCardIndex])}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <BackButton />
        {currentCardIndex < learningCards.length ? (
          <Flashcard
            key={learningCards[currentCardIndex]?.id}
            card={learningCards[currentCardIndex]}
            onMastered={handleMastered}
            onReviewAgain={handleReviewAgain}
          />
        ) : (
          <View>
            <Text style={globalStyles.text}>
              Completed {currentCardIndex + 1}/{learningCards.length} Cards
            </Text>
            {isSubmitPressed && (
              <CustomButton
                title="Continue"
                onPress={handleNextCard}
                style={{
                  backgroundColor: globalColors.secondary,
                }}
              />
            )}
            {renderCard(learningCards[currentCardIndex])}
          </View>
        )}
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
});

export default LearningSessionScreen;
