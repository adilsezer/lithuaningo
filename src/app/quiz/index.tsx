import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import sentenceService, { Sentence } from "../../services/data/sentenceService";
import wordService, { Word } from "../../services/data/wordService";
import { useThemeStyles } from "@src/hooks/useThemeStyles";

const QuizScreen: React.FC = () => {
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [question, setQuestion] = useState<string>("");
  const [options, setOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<string>("");
  const [quizType, setQuizType] = useState<"multipleChoice" | "fillInTheBlank">(
    "multipleChoice"
  );
  const [answer, setAnswer] = useState<string>("");
  const router = useRouter();
  const { styles: globalStyles } = useThemeStyles();

  useEffect(() => {
    const loadQuizData = async () => {
      try {
        const [fetchedSentences, fetchedWords] = await Promise.all([
          sentenceService.fetchSentences(),
          wordService.fetchWords(),
        ]);
        setSentences(fetchedSentences);
        setWords(fetchedWords);

        // Example of setting a question and options
        // This would be dynamically set based on the data
        setQuizType("multipleChoice"); // or "fillInTheBlank"
        setQuestion(
          "In the sentence 'Lietuva yra laisva šalis', what does 'laisva' mean in English?"
        );
        setOptions(["free", "country", "is", "Lithuania"]);
        setCorrectAnswer("free");
      } catch (error) {
        console.error("Error loading quiz data:", error);
      }
    };

    loadQuizData();
  }, []);

  const checkAnswer = () => {
    if (quizType === "fillInTheBlank") {
      if (answer.toLowerCase() === correctAnswer.toLowerCase()) {
        alert("Correct!");
      } else {
        alert(`Wrong! The correct answer is "${correctAnswer}".`);
      }
    } else {
      // For multiple choice, correctAnswer would be compared with selected option
      if (answer === correctAnswer) {
        alert("Correct!");
      } else {
        alert(`Wrong! The correct answer is "${correctAnswer}".`);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={globalStyles.title}>Quiz</Text>
      <Text style={globalStyles.text}>{question}</Text>

      {quizType === "fillInTheBlank" ? (
        <TextInput
          style={styles.input}
          value={answer}
          onChangeText={setAnswer}
          placeholder="Type your answer here"
        />
      ) : (
        options.map((option, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.option}
            onPress={() => setAnswer(option)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))
      )}

      <Button title="Submit" onPress={checkAnswer} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  option: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  optionText: {
    textAlign: "center",
  },
});

export default QuizScreen;
