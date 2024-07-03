import sentenceService, { Sentence } from "../services/data/sentenceService";
import wordService, { Word } from "../services/data/wordService";
import { retrieveData, storeData } from "@utils/storageUtil";
import { toTitleCase } from "./stringUtils";
import { getCurrentDateKey } from "./dateUtils";

export interface QuizState {
  similarSentences: Sentence[];
  sentenceText: string;
  questionText: string;
  image: string;
  translation: string;
  options: string[];
  correctAnswerText: string;
  questionType: "multipleChoice" | "fillInTheBlank" | "trueFalse";
  questionIndex: number;
  showContinueButton: boolean;
  quizCompleted: boolean;
}

export const initializeQuizState = (): QuizState => ({
  similarSentences: [],
  questionText: "",
  sentenceText: "",
  translation: "",
  image: "",
  options: [],
  correctAnswerText: "",
  questionType: "multipleChoice",
  questionIndex: 0,
  showContinueButton: false,
  quizCompleted: false,
});

const SENTENCES_KEY = `sentences-${getCurrentDateKey()}`;
const LAST_CHOSEN_WORD_KEY = "lastChosenWord";

export const loadQuizData = async (
  userData: any,
  setQuizState: React.Dispatch<React.SetStateAction<QuizState>>,
  QUIZ_PROGRESS_KEY: string
) => {
  if (!userData?.id) return;
  try {
    const fetchedLearnedSentences = await retrieveData<Sentence[]>(
      SENTENCES_KEY
    );

    if (!fetchedLearnedSentences) {
      console.error("No learned sentences found.");
      return;
    }

    const fetchedSentences = await sentenceService.fetchSentences();

    const sortedSentencesPromises = fetchedLearnedSentences.map(
      (learnedSentence) =>
        getSortedSentencesBySimilarity(learnedSentence, fetchedSentences)
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
  } catch (error) {
    console.error("Error loading quiz data:", error);
  }
};

const cleanWord = (word: string) => {
  return word.replace(/[.,!?;:()"]/g, "");
};

export const loadQuestion = async (
  similarSentence: Sentence,
  setQuizState: React.Dispatch<React.SetStateAction<QuizState>>
) => {
  try {
    const fetchedLearnedSentences = await retrieveData<Sentence[]>(
      SENTENCES_KEY
    );

    if (!fetchedLearnedSentences) {
      console.error("No learned sentences found.");
      return;
    }

    const learnedWords = new Set(
      fetchedLearnedSentences.flatMap((sentence) =>
        sentence.sentence.split(" ").map(cleanWord)
      )
    );

    const sentenceWords = similarSentence.sentence.split(" ").map(cleanWord);

    const skippedWords = getSkippedWords();

    const validWords = sentenceWords.filter(
      (word) => learnedWords.has(word) && !skippedWords.includes(word)
    );

    const shuffledWords = validWords.sort(() => 0.5 - Math.random());

    let lastChosenWord =
      (await retrieveData<string>(LAST_CHOSEN_WORD_KEY)) || "";
    let randomWord: string | undefined;
    let correctWordDetails: Word | null = null;
    let foundValidWord = false;

    // Try to find a valid word that is not the last chosen word and not the last candidate
    for (let i = 0; i < shuffledWords.length; i++) {
      const word = shuffledWords[i];

      if (word !== lastChosenWord || i === shuffledWords.length - 1) {
        randomWord = word;
        correctWordDetails = await wordService.fetchWordByGrammaticalForm(
          randomWord
        );

        if (correctWordDetails) {
          foundValidWord = true;
          break;
        }

        console.warn("No word details found for the random word", randomWord);
      }
    }

    // Fallback to a random word in sentenceWords if no valid word was found
    if (!foundValidWord) {
      ("Getting words in sentenceWords if no valid word was found");
      const fallbackWord =
        sentenceWords[Math.floor(Math.random() * sentenceWords.length)];
      randomWord = fallbackWord;
      correctWordDetails = await wordService.fetchWordByGrammaticalForm(
        randomWord
      );
    }

    if (!correctWordDetails || !randomWord) {
      setQuizState((prev) => ({
        ...prev,
        sentenceText: "No valid question could be generated. Please try again.",
        questionText: "",
        translation: "",
        image: "",
        options: [],
      }));
      return;
    }

    const fetchedWords = await wordService.fetchWords();
    const otherOptions = await getRandomOptions(
      fetchedWords,
      correctWordDetails.englishTranslation // Fetch similar words to the correct answer
    );

    const generatedQuestionType = getRandomQuestionType();

    let generatedSentenceText = "";
    let generatedQuestionText = "";
    let generatedOptions: string[] = [];
    let generatedTranslation = similarSentence.englishTranslation;
    let wordImage = correctWordDetails.imageUrl;
    let generatedCorrectAnswerText = toTitleCase(
      correctWordDetails.englishTranslation
    );

    if (generatedQuestionType === "multipleChoice") {
      generatedQuestionText = `What is the base form of **${toTitleCase(
        randomWord
      )}** in the sentence below?`;
      generatedSentenceText = similarSentence.sentence;
      generatedOptions = [...otherOptions, generatedCorrectAnswerText]
        .map(toTitleCase)
        .sort(() => Math.random() - 0.5);
    } else if (generatedQuestionType === "fillInTheBlank") {
      const sentenceWithBlank = similarSentence.sentence.replace(
        randomWord,
        "[...]"
      );
      generatedQuestionText = `Complete the sentence:`;
      generatedSentenceText = sentenceWithBlank;
      generatedCorrectAnswerText = toTitleCase(randomWord); // Use the hidden word itself
      generatedOptions = [];
    } else if (generatedQuestionType === "trueFalse") {
      const randomBool = Math.random() > 0.5;
      const givenTranslation = randomBool
        ? generatedCorrectAnswerText
        : otherOptions[0];
      generatedQuestionText = `Does **${toTitleCase(
        randomWord
      )}** mean **${toTitleCase(givenTranslation)}** in the sentence below?`;
      generatedSentenceText = similarSentence.sentence;
      generatedCorrectAnswerText = randomBool ? "True" : "False";
      generatedOptions = ["True", "False"];
    }

    await storeData(LAST_CHOSEN_WORD_KEY, randomWord);

    setQuizState((prev) => ({
      ...prev,
      questionText: generatedQuestionText,
      sentenceText: generatedSentenceText,
      translation: generatedTranslation,
      image: wordImage,
      correctAnswerText: generatedCorrectAnswerText,
      options: generatedOptions,
      questionType: generatedQuestionType,
      showContinueButton: false,
    }));
  } catch (error) {
    console.error("Error loading question:", error);
  }
};

// Utility functions

function levenshtein(a: string, b: string): number {
  const matrix = [];

  // Initialize the matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) == a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

export const getSimilarityScores = (
  target: string,
  candidates: string[]
): Map<string, number> => {
  const similarityScores = new Map<string, number>();

  candidates.forEach((candidate) => {
    const distance = levenshtein(target, candidate);
    const similarity = 1 / (1 + distance); // Convert distance to similarity
    similarityScores.set(candidate, similarity);
  });

  return similarityScores;
};

export const getSortedSentencesBySimilarity = async (
  learnedSentence: Sentence,
  allSentences: Sentence[]
): Promise<Sentence[]> => {
  const candidateSentences = allSentences.map((sentence) => sentence.sentence);

  const similarityScores = getSimilarityScores(
    learnedSentence.sentence,
    candidateSentences
  );

  return allSentences
    .sort(
      (a, b) =>
        similarityScores.get(b.sentence)! - similarityScores.get(a.sentence)!
    )
    .map((item) => item);
};

export const getRandomOptions = async (
  words: Word[],
  correctAnswerText: string
): Promise<string[]> => {
  const numberPattern =
    /^(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion)([-\s]?)(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion)*$/i;

  const candidateWords = words
    .map((word) => word.englishTranslation)
    .filter((word) => !numberPattern.test(word.toLowerCase())); // Exclude number words

  const similarityScores = getSimilarityScores(
    correctAnswerText,
    candidateWords
  );

  const sortedOptions = Array.from(similarityScores.entries())
    .filter(([word]) => word !== correctAnswerText)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);

  const topTwoOptions = sortedOptions.slice(0, 2);

  // Get the remaining candidates that are not in the top two options
  const remainingCandidates = candidateWords.filter(
    (word) => !topTwoOptions.includes(word) && word !== correctAnswerText
  );

  // Select a random word from the remaining candidates
  const randomIndex = Math.floor(Math.random() * remainingCandidates.length);
  const randomOption = remainingCandidates[randomIndex];

  // Combine the top two options with the random option
  const finalOptions = [...topTwoOptions, randomOption];

  // Shuffle the final options array to avoid any positional bias
  for (let i = finalOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [finalOptions[i], finalOptions[j]] = [finalOptions[j], finalOptions[i]];
  }

  return finalOptions;
};

export const getSkippedWords = (): string[] => {
  return [
    "yra",
    "Aš",
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
  // Generate a random value between 0 (inclusive) and 1 (exclusive)
  const randomValue = Math.random();

  // Return "multipleChoice" if randomValue is less than 0.45 (45% chance)
  if (randomValue < 0.45) {
    return "multipleChoice";
  }
  // Return "fillInTheBlank" if randomValue is between 0.45 (inclusive) and 0.85 (exclusive) (40% chance)
  else if (randomValue < 0.85) {
    return "fillInTheBlank";
  }
  // Return "trueFalse" if randomValue is 0.85 or greater (15% chance)
  else {
    return "trueFalse";
  }
};
