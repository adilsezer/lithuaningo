import React, { useEffect, useState } from "react";
import {
  View,
  Text,
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
import { router } from "expo-router";

const LearningSessionScreen: React.FC = () => {
  const [learningCards, setLearningCards] = useState<LearningCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [learnedCards, setLearnedCards] = useState<string[]>([]);
  const [flashcardsCompleted, setFlashcardsCompleted] = useState(false);
  const [completedToday, setCompletedToday] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [showQuizCards, setShowQuizCards] = useState(false);
  const userData = useAppSelector(selectUserData);
  const userId = userData?.id || "";
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const cardsPerDay = 15;

  const updateStorage = async (
    flashcardsCompleted: boolean,
    currentCardIndex: number,
    completedToday: boolean
  ) => {
    const today = new Date().toISOString().split("T")[0];
    await storeData(`dailyCards_${userId}`, {
      date: today,
      cards: learningCards,
      flashcardsCompleted,
      currentCardIndex,
      completedToday,
    });
  };

  useEffect(() => {
    const fetchDailyCards = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const storedData = await retrieveData<{
          date: string;
          cards: LearningCard[];
          flashcardsCompleted: boolean;
          currentCardIndex: number;
          completedToday: boolean;
        }>(`dailyCards_${userId}`);
        if (
          storedData &&
          storedData.date === today &&
          storedData.cards.length > 0
        ) {
          setLearningCards(storedData.cards);
          setFlashcardsCompleted(storedData.flashcardsCompleted);
          setCurrentCardIndex(storedData.currentCardIndex);
          setCompletedToday(storedData.completedToday);
        } else {
          if (storedData) {
            await clearData(`dailyCards_${userId}`);
          }
          const cards = await FirebaseDataService.fetchLearningCards(userId);
          if (cards.length > 0) {
            const dailyCards = cards.slice(0, cardsPerDay);
            setLearningCards(dailyCards);
            await updateStorage(false, 0, false);
          }
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchDailyCards();
  }, [userId]);

  const handleMastered = async (cardId: string) => {
    setLearnedCards((prev) => [...prev, cardId]);
    await handleNextFlashCard();
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
    await updateStorage(flashcardsCompleted, currentCardIndex, completedToday);
  };

  const handleNextFlashCard = async () => {
    setCurrentCardIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      if (nextIndex >= learningCards.length) {
        return 0;
      } else {
        return nextIndex;
      }
    });

    const nextIndex = currentCardIndex + 1;
    if (nextIndex >= learningCards.length) {
      setFlashcardsCompleted(true);
      await updateStorage(true, 0, completedToday);
    } else {
      await updateStorage(false, nextIndex, completedToday);
    }
  };

  const saveLearnedCards = async () => {
    try {
      await FirebaseDataService.updateUserLearnedCards(userId, learnedCards);
    } catch (error) {
      console.error("Error updating learned cards:", error);
    }
  };

  useEffect(() => {
    if (completedToday) {
      saveLearnedCards();
    }
  }, [completedToday]);

  const handleNextQuizCard = async () => {
    if (currentCardIndex < learningCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowContinueButton(false);
    } else {
      if (userData?.id) {
        setCompletedToday(true);
      }
    }
  };

  const handleQuizSubmit = async () => {
    setShowContinueButton(true);
    if (currentCardIndex < learningCards.length - 1) {
      await updateStorage(
        flashcardsCompleted,
        currentCardIndex + 1,
        completedToday
      );
    } else {
      await updateStorage(flashcardsCompleted, currentCardIndex, true);
    }
  };

  const renderCard = (card: LearningCard | undefined) => {
    if (!card) {
      return <Text>No card to display</Text>;
    }

    switch (card.type) {
      case "multiple_choice":
        return (
          <MultipleChoiceCard card={card} onOptionSelect={handleQuizSubmit} />
        );
      case "fill_in_the_blank":
        return (
          <FillInTheBlankCard
            card={card}
            onSubmit={handleQuizSubmit}
            isSubmitPressed={showContinueButton}
          />
        );
      default:
        return <Text>Unknown card type</Text>;
    }
  };

  if (completedToday) {
    return (
      <ScrollView>
        <BackButton />
        <Text style={globalStyles.title}>
          You have completed today's session!
        </Text>
        <CustomButton
          title="Go to Leaderboard"
          onPress={() => router.push("/dashboard/leaderboard")}
          style={{
            backgroundColor: globalColors.secondary,
          }}
        />
      </ScrollView>
    );
  }

  if (learningCards.length === 0) {
    return (
      <ScrollView>
        <BackButton />
        <Text style={globalStyles.title}>
          No new cards available. You have mastered all the available cards.
          Please come back tomorrow for more learning!
        </Text>
        <CustomButton
          title="Go to Dashboard"
          onPress={() => router.push("/dashboard")}
          style={{
            backgroundColor: globalColors.secondary,
          }}
        />
      </ScrollView>
    );
  }

  if (flashcardsCompleted) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView>
          <BackButton />
          <Text style={globalStyles.subtitle}>
            Completed {currentCardIndex + 1}/{learningCards.length} Cards
          </Text>
          {!showQuizCards ? (
            <View>
              <Text style={globalStyles.title}>
                Completed all flashcards. Now continue with the quiz.
              </Text>

              <CustomButton
                title="Continue"
                onPress={() => setShowQuizCards(true)}
                style={{
                  backgroundColor: globalColors.secondary,
                }}
              />
            </View>
          ) : (
            <View>
              {renderCard(learningCards[currentCardIndex])}
              {showContinueButton && (
                <CustomButton
                  title="Continue"
                  onPress={handleNextQuizCard}
                  style={{
                    backgroundColor: globalColors.secondary,
                  }}
                />
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView>
        <BackButton />
        <Text style={globalStyles.subtitle}>
          Completed {currentCardIndex + 1}/{learningCards.length} Cards
        </Text>
        {currentCardIndex < learningCards.length && (
          <Flashcard
            key={learningCards[currentCardIndex]?.id}
            card={learningCards[currentCardIndex]}
            onMastered={handleMastered}
            onReviewAgain={handleReviewAgain}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LearningSessionScreen;
