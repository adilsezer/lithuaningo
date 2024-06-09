import { useState, useEffect } from "react";

const normalizeAnswer = (answer: string): string => {
  const lithuanianMap: Record<string, string> = {
    Ą: "A",
    Ę: "E",
    Ė: "E",
    Į: "I",
    Ų: "U",
    Ū: "U",
    Č: "C",
    Š: "S",
    Ž: "Z",
  };

  return answer
    .toUpperCase()
    .replace(/[ĄĘĖĮŲŪČŠŽ]/g, (match) => lithuanianMap[match] || match)
    .toLowerCase();
};

export const useCardLogic = (correctAnswer: string, baseForm: string) => {
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
      normalizeAnswer(option.trim()) === normalizeAnswer(correctAnswer.trim());
    setIsCorrect(correct);
    return correct;
  };

  const handleSubmit = (userAnswer: string): boolean => {
    const normalizedUserAnswer = normalizeAnswer(userAnswer.trim());
    const correct =
      normalizedUserAnswer === normalizeAnswer(correctAnswer.trim()) ||
      normalizedUserAnswer === normalizeAnswer(baseForm.trim());
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
