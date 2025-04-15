import { useState } from "react";
import {
  FlashcardResponse,
  FlashcardCategory,
  DifficultyLevel,
} from "@src/types/Flashcard";
import { useFlashcards } from "./useFlashcards";

interface UseFlashcardNavigationProps {
  id: string;
  initialIndex?: number;
}

export const useFlashcardNavigation = ({
  id,
  initialIndex = 0,
}: UseFlashcardNavigationProps) => {
  const { flashcards, isLoading, error, getFlashcards } = useFlashcards();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [flipped, setFlipped] = useState(false);

  const fetchFlashcards = async () => {
    try {
      const numericId = parseInt(id);

      // Determine if it's a difficulty level or a category
      if (numericId >= 0 && numericId <= 2) {
        // It's a difficulty level
        await getFlashcards({
          primaryCategory: FlashcardCategory.AllCategories, // Get all categories
          count: 10,
          difficulty: numericId as DifficultyLevel,
        });
      } else {
        // It's a category
        await getFlashcards({
          primaryCategory: numericId as FlashcardCategory,
          count: 10,
          difficulty: DifficultyLevel.Basic, // Default difficulty
        });
      }
    } catch (err) {
      console.error("Error fetching flashcards:", err);
    }
  };

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setFlipped(false);
    }
  };

  const getCurrentFlashcard = (): FlashcardResponse | null => {
    return flashcards.length > 0 ? flashcards[currentIndex] : null;
  };

  return {
    flashcards,
    currentFlashcard: getCurrentFlashcard(),
    currentIndex,
    flipped,
    isLoading,
    error,
    fetchFlashcards,
    handleFlip,
    handleNext,
    handlePrevious,
    totalCards: flashcards.length,
    hasNext: currentIndex < flashcards.length - 1,
    hasPrevious: currentIndex > 0,
  };
};
