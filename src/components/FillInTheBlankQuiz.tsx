import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import CustomButton from "./CustomButton";
import ExpandableDetails from "./ExpandableDetails";
import CustomTextInput from "./CustomTextInput";

const { width } = Dimensions.get("window");
const isTablet = (Platform.OS === "ios" && Platform.isPad) || width >= 768;

interface FillInTheBlankQuizProps {
  sentenceText: string;
  questionText: string;
  translation: string;
  image: string;
  correctAnswerText: string;
  questionIndex: number;
  onAnswer: (isCorrect: boolean) => void;
}

const FillInTheBlankQuiz: React.FC<FillInTheBlankQuizProps> = ({
  sentenceText,
  questionText,
  correctAnswerText,
  translation,
  image,
  questionIndex,
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
  }, [questionIndex]);

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

  const handleFormSubmit = () => {
    const correct =
      normalizeAnswer(inputText.trim()) ===
      normalizeAnswer(correctAnswerText.trim());
    setIsCorrect(correct);
    onAnswer(correct);
    setIsSubmitPressed(true);
  };

  const getQuestionWithAnswer = () => {
    const placeholderIndex = sentenceText.indexOf("[...]");
    let adjustedAnswer = correctAnswerText;

    // Check if the placeholder is at the beginning of the sentence
    if (placeholderIndex !== 0) {
      adjustedAnswer =
        correctAnswerText.charAt(0).toLowerCase() + correctAnswerText.slice(1);
    }

    return sentenceText.replace("[...]", adjustedAnswer);
  };

  return (
    <View>
      {!isSubmitPressed && (
        <Text style={globalStyles.subtitle}>{questionText}</Text>
      )}
      <Text style={globalStyles.title}>
        {isSubmitPressed ? getQuestionWithAnswer() : sentenceText}
      </Text>
      <ExpandableDetails translation={translation}></ExpandableDetails>
      {image && (
        <Image
          source={{ uri: image }}
          style={[styles.image, isTablet && styles.imageTablet]}
        />
      )}
      {isSubmitPressed && (
        <View>
          <Text style={globalStyles.subtitle}>
            You answered:{" "}
            <Text
              style={[globalStyles.subtitle, { fontFamily: "Roboto-Bold" }]}
            >
              {inputText}
            </Text>
          </Text>
          <Text style={globalStyles.subtitle}>
            Correct answer:{" "}
            <Text
              style={[globalStyles.subtitle, { fontFamily: "Roboto-Bold" }]}
            >
              {correctAnswerText}
            </Text>
          </Text>
        </View>
      )}
      {isCorrect !== null && (
        <View>
          <Text
            style={[
              globalStyles.title,
              {
                color: isCorrect ? globalColors.active : globalColors.error,
              },
            ]}
          >
            {isCorrect ? "Correct" : "Incorrect"}
          </Text>
        </View>
      )}
      {!isSubmitPressed && (
        <View>
          <CustomTextInput
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
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 250,
    height: 250,
    marginBottom: 10,
    alignSelf: "center",
    borderRadius: 10,
  },
  imageTablet: {
    width: 500, // Full width for tablet
    height: 500,
  },
});

export default FillInTheBlankQuiz;
