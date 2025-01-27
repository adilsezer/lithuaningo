import React, { useState, useEffect } from "react";
import { View, StyleSheet, Image, Dimensions, Platform } from "react-native";
import RenderClickableWords from "@components/learning/RenderClickableWords";
import { Form } from "@components/form/Form";
import type { FormField } from "@components/form/form.types";
import { quizFormSchema } from "@utils/zodSchemas";
import CustomText from "@components/typography/CustomText";
import { useTheme } from "react-native-paper";
const { width } = Dimensions.get("window");
const isTablet = (Platform.OS === "ios" && Platform.isPad) || width >= 768;

interface FillInTheBlankQuizProps {
  sentenceText: string;
  questionText: string;
  questionWord: string;
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
  questionWord,
  onAnswer,
}) => {
  const theme = useTheme();
  const [isSubmitPressed, setIsSubmitPressed] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [submittedAnswer, setSubmittedAnswer] = useState<string>("");

  useEffect(() => {
    setIsSubmitPressed(false);
    setIsCorrect(null);
    setSubmittedAnswer("");
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

  const handleFormSubmit = (values: { answer: string }) => {
    const correct =
      normalizeAnswer(values.answer.trim()) ===
      normalizeAnswer(correctAnswerText.trim());
    setIsCorrect(correct);
    setSubmittedAnswer(values.answer);
    onAnswer(correct);
    setIsSubmitPressed(true);
  };

  const getQuestionWithAnswer = () => {
    const placeholderIndex = sentenceText.indexOf("[...]");
    let adjustedAnswer = correctAnswerText;

    if (placeholderIndex !== 0) {
      adjustedAnswer =
        correctAnswerText.charAt(0).toLowerCase() + correctAnswerText.slice(1);
    }

    return sentenceText.replace("[...]", adjustedAnswer);
  };

  const quizFields: FormField[] = [
    {
      name: "answer",
      label: "Answer",
      category: "text-input",
      type: "text",
      placeholder: "Type your answer here",
    },
  ];

  return (
    <View>
      {!isSubmitPressed && (
        <>
          <CustomText>{questionText}</CustomText>
          <View style={styles.sentenceContainer}>
            <RenderClickableWords
              sentenceText={sentenceText}
              answerText={questionWord}
            />
          </View>
          <CustomText>Click on each word to find out what it means.</CustomText>
        </>
      )}

      {isSubmitPressed && <CustomText>{getQuestionWithAnswer()}</CustomText>}

      <CustomText
        style={[
          styles.translation,
          {
            backgroundColor: theme.colors.primaryContainer,
            borderColor: theme.colors.surface,
          },
        ]}
      >
        Translation: {translation}
      </CustomText>

      {image && (
        <Image
          source={{ uri: image }}
          style={[styles.image, isTablet && styles.imageTablet]}
        />
      )}

      {isSubmitPressed && (
        <View>
          <CustomText>
            You answered:{" "}
            <CustomText>
              {submittedAnswer}
            </CustomText>
          </CustomText>
          <CustomText>
            Correct answer:{" "}
            <CustomText>
              {correctAnswerText}
            </CustomText>
          </CustomText>
        </View>
      )}

      {isCorrect !== null && (
        <View>
          <CustomText
            style={{
              color: isCorrect ? theme.colors.primary : theme.colors.error,
            }}
          >
            {isCorrect ? "Correct" : "Incorrect"}
          </CustomText>
        </View>
      )}

      {!isSubmitPressed && (
        <Form
          fields={quizFields}
          onSubmit={handleFormSubmit}
          submitButtonText="Submit"
          style={styles.form}
          zodSchema={quizFormSchema}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sentenceContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginVertical: 10,
  },
  translation: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
    marginVertical: 14,
  },
  image: {
    width: 250,
    height: 250,
    marginBottom: 10,
    alignSelf: "center",
    borderRadius: 10,
  },
  imageTablet: {
    width: 500,
    height: 500,
  },
  form: {
    paddingHorizontal: 0,
  },
});

export default FillInTheBlankQuiz;
