// hooks/useCardLogic.ts
import { useState, useEffect } from "react";

export const useCardLogic = (correctAnswer: string) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    // Reset state when answer changes
    setSelectedOption(null);
    setIsCorrect(null);
  }, [correctAnswer]);

  const handlePress = (option: string): boolean => {
    if (selectedOption !== null) {
      return false; // Prevent further selection once an option is chosen
    }
    setSelectedOption(option);
    const correct =
      option.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
    setIsCorrect(correct);
    return correct;
  };

  const handleSubmit = (userAnswer: string): boolean => {
    const correct =
      userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
    setSelectedOption(userAnswer);
    setIsCorrect(correct);
    return correct;
  };

  return {
    selectedOption,
    isCorrect,
    handlePress,
    handleSubmit,
  };
};
