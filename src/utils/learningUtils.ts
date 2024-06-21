// src/utils/learningUtils.ts
import sentenceService, { Sentence } from "../services/data/sentenceService";
import wordService, { Word } from "../services/data/wordService";
import userProfileService from "../services/data/userProfileService";
import { retrieveData } from "@utils/storageUtil";
import { Dispatch } from "redux";
import { setLoading } from "@src/redux/slices/uiSlice";
import { toTitleCase } from "./stringUtils";

export interface QuizState {
  similarSentences: Sentence[];
  quizText: string;
  question: string;
  image: string;
  translation: string;
  options: string[];
  correctAnswer: string;
  quizType: "multipleChoice" | "fillInTheBlank" | "trueFalse";
  questionIndex: number;
  showContinueButton: boolean;
  quizCompleted: boolean;
}

export const initializeQuizState = (): QuizState => ({
  similarSentences: [],
  quizText: "",
  question: "",
  translation: "",
  image: "",
  options: [],
  correctAnswer: "",
  quizType: "multipleChoice",
  questionIndex: 0,
  showContinueButton: false,
  quizCompleted: false,
});

export const loadQuizData = async (
  userData: any,
  dispatch: Dispatch<any>,
  setLoadingAction: typeof setLoading,
  setQuizState: React.Dispatch<React.SetStateAction<QuizState>>,
  QUIZ_PROGRESS_KEY: string
) => {
  if (!userData?.id) return;
  try {
    dispatch(setLoadingAction(true));

    const recentLearnedSentenceIds =
      await userProfileService.getMostRecentTwoLearnedSentences(userData.id);

    const fetchedLearnedSentences = await Promise.all(
      recentLearnedSentenceIds.map((id) =>
        sentenceService.fetchSentenceById(id)
      )
    );

    const fetchedSentences = await sentenceService.fetchSentences();

    const maxOrder = Math.max(
      ...fetchedLearnedSentences.map((sentence) => sentence.displayOrder)
    );

    const filteredSentences = fetchedSentences.filter(
      (sentence) => sentence.displayOrder <= maxOrder
    );

    const sortedSentencesPromises = fetchedLearnedSentences.map(
      (learnedSentence) =>
        getSortedSentencesBySimilarity(learnedSentence, filteredSentences)
    );

    const sortedSentencesArrays = await Promise.all(sortedSentencesPromises);

    const topSimilarSentences = sortedSentencesArrays.flatMap((sentences) =>
      sentences.slice(0, 5)
    );

    setQuizState((prev) => ({
      ...prev,
      similarSentences: topSimilarSentences,
    }));

    const storedProgress = await retrieveData<number>(QUIZ_PROGRESS_KEY);
    if (storedProgress !== null) {
      if (storedProgress >= topSimilarSentences.length) {
        setQuizState((prev) => ({ ...prev, quizCompleted: true }));
      } else {
        setQuizState((prev) => ({ ...prev, questionIndex: storedProgress }));
        loadQuestion(topSimilarSentences[storedProgress], setQuizState);
      }
    } else {
      loadQuestion(topSimilarSentences[0], setQuizState);
    }

    dispatch(setLoadingAction(false));
  } catch (error) {
    console.error("Error loading quiz data:", error);
    dispatch(setLoadingAction(false));
  }
};

export const loadQuestion = async (
  similarSentence: Sentence,
  setQuizState: React.Dispatch<React.SetStateAction<QuizState>>
) => {
  try {
    const sentenceWords = similarSentence.sentence.split(" ");
    const skippedWords = getSkippedWords();
    let randomWord: string | undefined;
    let correctWordDetails: Word | null = null;

    const shuffledWords = sentenceWords.sort(() => 0.5 - Math.random());

    for (const word of shuffledWords) {
      if (skippedWords.includes(word)) {
        continue;
      }

      randomWord = word;
      correctWordDetails = await wordService.fetchWordByGrammaticalForm(
        randomWord
      );

      if (correctWordDetails) break;

      console.warn("No word details found for the random word", randomWord);
    }

    if (!correctWordDetails || !randomWord) {
      setQuizState((prev) => ({
        ...prev,
        question: "No valid question could be generated. Please try again.",
        quizText: "",
        translation: "",
        image: "",
        options: [],
      }));
      return;
    }

    const fetchedWords = await wordService.fetchWords();
    const otherOptions = getRandomOptions(
      fetchedWords,
      correctWordDetails.englishTranslation
    );

    const questionType = getRandomQuestionType();

    let question = "";
    let quizText = "";
    let options: string[] = [];
    let translation = similarSentence.englishTranslation;
    let image = correctWordDetails.imageUrl;
    let correctAnswer = toTitleCase(correctWordDetails.englishTranslation);

    if (questionType === "multipleChoice") {
      quizText = `What is the base form of **${toTitleCase(
        randomWord
      )}** in the sentence below?`;
      question = similarSentence.sentence;
      options = [...otherOptions, correctAnswer]
        .map(toTitleCase)
        .sort(() => Math.random() - 0.5);
    } else if (questionType === "fillInTheBlank") {
      const sentenceWithBlank = similarSentence.sentence.replace(
        randomWord,
        "[...]"
      );
      quizText = `Complete the sentence:`;
      question = sentenceWithBlank;
      correctAnswer = toTitleCase(randomWord); // Use the hidden word itself
      options = [];
    } else if (questionType === "trueFalse") {
      const randomBool = Math.random() > 0.5;
      const givenTranslation = randomBool ? correctAnswer : otherOptions[0];
      quizText = `Does **${toTitleCase(randomWord)}** mean **${toTitleCase(
        givenTranslation
      )}** in the sentence below?`;
      question = similarSentence.sentence;
      correctAnswer = randomBool ? "True" : "False";
      options = ["True", "False"];
    }

    setQuizState((prev) => ({
      ...prev,
      question,
      quizText,
      translation,
      image,
      correctAnswer,
      options,
      quizType: questionType,
      showContinueButton: false,
    }));
  } catch (error) {
    console.error("Error loading question:", error);
  }
};

// Utility functions

export const tokenizeSentence = (sentence: string): Set<string> => {
  return new Set(sentence.toLowerCase().split(" "));
};

export const jaccardSimilarity = (
  set1: Set<string>,
  set2: Set<string>
): number => {
  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
};

export const createGrammaticalFormsMap = async (): Promise<
  Map<string, string>
> => {
  const words: Word[] = await wordService.fetchWords();
  const grammaticalFormsMap = new Map<string, string>();

  words.forEach((word: Word) => {
    word.grammaticalForms.forEach((form: string) => {
      grammaticalFormsMap.set(form, word.id);
    });
  });

  return grammaticalFormsMap;
};

export const normalizeSentence = (
  sentence: string,
  formsMap: Map<string, string>
): string[] => {
  return sentence
    .toLowerCase()
    .split(" ")
    .map((word: string) => formsMap.get(word) || word);
};

export const getSortedSentencesBySimilarity = async (
  learnedSentence: Sentence,
  allSentences: Sentence[]
): Promise<Sentence[]> => {
  const grammaticalFormsMap = await createGrammaticalFormsMap();

  // Define a set of stopwords to exclude
  const stopwords = new Set(getSkippedWords());

  // Function to filter out stopwords and numbers
  const filterTokens = (tokens: Set<string>): Set<string> => {
    return new Set(
      [...tokens].filter(
        (token) => !stopwords.has(token) && !/^\d+$/.test(token)
      )
    );
  };

  const learnedTokens = filterTokens(
    new Set(normalizeSentence(learnedSentence.sentence, grammaticalFormsMap))
  );

  const sentenceSimilarities = allSentences.map((sentence) => {
    const sentenceTokens = filterTokens(
      new Set(normalizeSentence(sentence.sentence, grammaticalFormsMap))
    );

    const similarity = jaccardSimilarity(learnedTokens, sentenceTokens);

    return { sentence, similarity };
  });

  // Sort sentences by similarity in descending order
  sentenceSimilarities.sort((a, b) => b.similarity - a.similarity);

  return sentenceSimilarities.map((item) => item.sentence);
};

export const getRandomOptions = (
  words: Word[],
  correctAnswer: string
): string[] => {
  const options = words
    .map((word: Word) => word.englishTranslation)
    .filter((option: string) => option !== correctAnswer);
  return options.sort(() => 0.5 - Math.random()).slice(0, 3); // Get 3 random options
};

export const getSkippedWords = (): string[] => {
  return [
    "yra",
    "aš",
    "buvo",
    "Mano",
    "ir",
    "tu",
    "jis",
    "ji",
    "mes",
    "jie",
    "jos",
    "tai",
  ];
};

export const getRandomQuestionType = ():
  | "multipleChoice"
  | "fillInTheBlank"
  | "trueFalse" => {
  const randomValue = Math.random();
  if (randomValue < 0.5) {
    return "multipleChoice";
  } else if (randomValue < 0.8) {
    return "fillInTheBlank";
  } else {
    return "trueFalse";
  }
};