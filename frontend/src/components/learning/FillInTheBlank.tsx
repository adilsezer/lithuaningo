import React, { useState, useEffect } from "react";
import { View, StyleSheet, Image, Dimensions, Platform } from "react-native";
import { useThemeStyles } from "@hooks/useThemeStyles";
import RenderClickableWords from "@components/learning/RenderClickableWords";
import { SectionTitle, Subtitle, Instruction } from "@components/typography";
import { Form } from "@components/form/Form";
import type { FormField } from "@components/form/form.types";

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
  const { colors } = useThemeStyles();
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
      validation: { required: true, message: "Please enter your answer" },
    },
  ];

  return (
    <View>
      {!isSubmitPressed && (
        <>
          <Subtitle>{questionText}</Subtitle>
          <View style={styles.sentenceContainer}>
            <RenderClickableWords
              sentenceText={sentenceText}
              answerText={questionWord}
              useClickedWordsColor={false}
            />
          </View>
          <Instruction>
            Click on each word to find out what it means.
          </Instruction>
        </>
      )}

      {isSubmitPressed && (
        <SectionTitle>{getQuestionWithAnswer()}</SectionTitle>
      )}

      <Subtitle
        style={[
          styles.translation,
          {
            backgroundColor: colors.wordBackground,
            borderColor: colors.border,
          },
        ]}
      >
        Translation: {translation}
      </Subtitle>

      {image && (
        <Image
          source={{ uri: image }}
          style={[styles.image, isTablet && styles.imageTablet]}
        />
      )}

      {isSubmitPressed && (
        <View>
          <Subtitle>
            You answered:{" "}
            <Subtitle style={{ fontFamily: "Roboto-Bold" }}>
              {submittedAnswer}
            </Subtitle>
          </Subtitle>
          <Subtitle>
            Correct answer:{" "}
            <Subtitle style={{ fontFamily: "Roboto-Bold" }}>
              {correctAnswerText}
            </Subtitle>
          </Subtitle>
        </View>
      )}

      {isCorrect !== null && (
        <View>
          <SectionTitle
            style={{
              color: isCorrect ? colors.active : colors.error,
            }}
          >
            {isCorrect ? "Correct" : "Incorrect"}
          </SectionTitle>
        </View>
      )}

      {!isSubmitPressed && (
        <Form
          fields={quizFields}
          onSubmit={handleFormSubmit}
          submitButtonText="Submit"
          style={styles.form}
        />
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
    width: 500,
    height: 500,
  },
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
  form: {
    paddingHorizontal: 0,
  },
});

export default FillInTheBlankQuiz;
