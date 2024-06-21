import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import CustomButton from "./CustomButton";
import ExpandableDetails from "./ExpandableDetails";

interface FillInTheBlankQuizProps {
  question: string;
  quizText: string;
  translation: string;
  image: string;
  correctAnswer: string;
  onAnswer: (isCorrect: boolean) => void;
}

const FillInTheBlankQuiz: React.FC<FillInTheBlankQuizProps> = ({
  question,
  quizText,
  correctAnswer,
  translation,
  image,
  onAnswer,
}) => {
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const [inputText, setInputText] = useState<string>("");
  const [isSubmitPressed, setIsSubmitPressed] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    setInputText("");
    setIsSubmitPressed(false);
    setIsCorrect(null);
  }, [question]);

  const handleFormSubmit = () => {
    const correct =
      inputText.trim().toLowerCase() === correctAnswer.toLowerCase();
    setIsCorrect(correct);
    onAnswer(correct);
    setIsSubmitPressed(true);
  };

  const getQuestionWithAnswer = () => {
    const placeholderIndex = question.indexOf("[...]");
    let adjustedAnswer = correctAnswer;

    // Check if the placeholder is at the beginning of the sentence
    if (placeholderIndex !== 0) {
      adjustedAnswer =
        correctAnswer.charAt(0).toLowerCase() + correctAnswer.slice(1);
    }

    return question.replace("[...]", adjustedAnswer);
  };

  return (
    <ScrollView>
      {!isSubmitPressed && (
        <Text style={globalStyles.subtitle}>{quizText}</Text>
      )}
      <Text style={globalStyles.title}>
        {isSubmitPressed ? getQuestionWithAnswer() : question}
      </Text>
      {image && <Image source={{ uri: image }} style={styles.image} />}
      {isCorrect !== null && (
        <View>
          <ExpandableDetails translation={translation}></ExpandableDetails>
          <Text
            style={[
              styles.feedbackText,
              { color: isCorrect ? globalColors.active : globalColors.error },
            ]}
          >
            {isCorrect
              ? "Correct"
              : `Incorrect. Correct Answer: ${correctAnswer}`}
          </Text>
        </View>
      )}
      {!isSubmitPressed && (
        <View>
          <TextInput
            style={globalStyles.input}
            placeholder="Type your answer here"
            placeholderTextColor={globalColors.placeholder}
            value={inputText}
            onChangeText={(text) => setInputText(text)}
            editable={isCorrect === null} // Disable input after submission
          />
          <CustomButton
            title="Submit"
            onPress={handleFormSubmit}
            disabled={isCorrect !== null}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  feedbackText: {
    marginTop: 5,
    fontSize: 16,
    alignSelf: "center",
    fontWeight: "bold",
  },
  image: {
    width: 300,
    height: 300,
    marginBottom: 10,
    alignSelf: "center",
    borderRadius: 10,
  },
});

export default FillInTheBlankQuiz;
