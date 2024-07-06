import sentenceService, { Sentence } from "../services/data/sentenceService";
import wordService, { Word } from "../services/data/wordService";
import { retrieveData } from "@utils/storageUtil";
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

const fetchLearnedAndAllSentencesWithWords = async () => {
  const learnedSentences = await retrieveData<Sentence[]>(SENTENCES_KEY);

  if (!learnedSentences) {
    throw new Error("No learned sentences found.");
  }

  console.log(
    "Learned Sentences:",
    learnedSentences.map((s) => s.sentence)
  );

  const allSentences = await sentenceService.fetchAndShuffleSentences();

  const allWords = await wordService.fetchWords();

  return { learnedSentences, allSentences, allWords };
};

const getLearnedWordsDetails = (
  learnedSentences: Sentence[],
  allWords: Word[]
) => {
  const learnedWords = new Set<string>(
    learnedSentences.flatMap((sentence) =>
      sentence.sentence.split(" ").map(cleanWord)
    )
  );

  const learnedWordsDetails = Array.from(learnedWords)
    .map(
      (word) =>
        allWords.find((wordDetail) =>
          wordDetail.grammaticalForms.includes(word.toLowerCase())
        ) || null
    )
    .filter((wordDetail): wordDetail is Word => !!wordDetail);

  console.log(
    "Learned Words Details:",
    learnedWordsDetails.map((wd) => wd.id)
  );

  return learnedWordsDetails;
};

const shuffleArray = <T>(array: T[]): T[] => {
  return array.sort(() => 0.5 - Math.random());
};

const getRelatedSentences = (allSentences: Sentence[], wordDetail: Word) => {
  const relatedSentences = allSentences.filter((sentence) =>
    sentence.sentence
      .split(" ")
      .some((word) =>
        wordDetail.grammaticalForms.includes(cleanWord(word).toLowerCase())
      )
  );
  console.log("Related Sentences for word:", wordDetail.id);
  relatedSentences.forEach((s, index) => {
    console.log(`${index + 1}. ${s.sentence}`);
  });

  return relatedSentences;
};

const cleanWord = (word: string): string => {
  return word.replace(/[.,!?;:()"]/g, "");
};

const removeDuplicates = (sentences: Sentence[]): Sentence[] => {
  const seenSentences = new Set<string>();
  const uniqueSentences = sentences.filter((sentence) => {
    if (seenSentences.has(sentence.sentence)) {
      return false;
    }
    seenSentences.add(sentence.sentence);
    return true;
  });

  console.log("Unique Sentences:");
  uniqueSentences.forEach((s, index) => {
    console.log(`${index + 1}. ${s.sentence}`);
  });

  return uniqueSentences;
};

export const loadQuizData = async (
  userData: any,
  setQuizState: React.Dispatch<React.SetStateAction<QuizState>>,
  QUIZ_PROGRESS_KEY: string
): Promise<void> => {
  if (!userData?.id) return;
  try {
    const { learnedSentences, allSentences, allWords } =
      await fetchLearnedAndAllSentencesWithWords();

    const learnedWordsDetails = getLearnedWordsDetails(
      learnedSentences,
      allWords
    );

    const sentencesPerWord = Math.ceil(10 / learnedWordsDetails.length);
    let shuffledSentences: Sentence[] = [];

    learnedWordsDetails.forEach((wordDetail) => {
      const relatedSentences = getRelatedSentences(allSentences, wordDetail);
      const selectedSentences = shuffleArray(relatedSentences).slice(
        0,
        sentencesPerWord
      );

      console.log(`Selected sentences for word: ${wordDetail.id}`);
      selectedSentences.forEach((sentence) =>
        console.log(`- ${sentence.sentence}`)
      );

      shuffledSentences.push(...selectedSentences);
    });

    shuffledSentences = removeDuplicates(shuffleArray(shuffledSentences)).slice(
      0,
      10
    );

    console.log("Shuffled Sentences:");
    shuffledSentences.forEach((s, index) => {
      console.log(`${index + 1}. ${s.sentence}`);
    });

    setQuizState((prev) => ({
      ...prev,
      similarSentences: shuffledSentences,
    }));

    const storedProgress = await retrieveData<number>(QUIZ_PROGRESS_KEY);
    console.log("Stored Progress:", storedProgress);

    if (storedProgress !== null) {
      if (storedProgress >= shuffledSentences.length) {
        setQuizState((prev) => ({ ...prev, quizCompleted: true }));
      } else {
        setQuizState((prev) => ({ ...prev, questionIndex: storedProgress }));
        await loadQuestion(shuffledSentences[storedProgress], setQuizState);
      }
    } else {
      await loadQuestion(shuffledSentences[0], setQuizState);
    }
  } catch (error) {
    console.error("Error loading quiz data:", error);
  }
};

export const loadQuestion = async (
  similarSentence: Sentence,
  setQuizState: React.Dispatch<React.SetStateAction<QuizState>>
): Promise<void> => {
  try {
    console.log("Loading question for sentence:", similarSentence.sentence);

    const { learnedSentences, allWords } =
      await fetchLearnedAndAllSentencesWithWords();

    const learnedWords = new Set<string>(
      learnedSentences.flatMap((sentence) =>
        sentence.sentence.split(" ").map(cleanWord)
      )
    );

    const similarSentenceWords = similarSentence.sentence
      .split(" ")
      .map(cleanWord);
    console.log("Similar Sentence Words:", similarSentenceWords);

    const skippedWords = getSkippedWords();

    const validWords = similarSentenceWords.filter(
      (word) => learnedWords.has(word) && !skippedWords.includes(word)
    );
    console.log("Valid Words:", validWords);

    const shuffledWords = shuffleArray(validWords);
    console.log("Shuffled Words:", shuffledWords);

    let randomWord: string | undefined;
    let correctWordDetails: Word | null = null;

    for (const word of shuffledWords) {
      randomWord = word;
      correctWordDetails =
        allWords.find((wordDetail) =>
          wordDetail.grammaticalForms.includes(word.toLowerCase())
        ) || null;
      if (correctWordDetails) break;
    }

    if (!correctWordDetails) {
      const fallbackWord = shuffleArray(similarSentenceWords)[0];
      randomWord = fallbackWord;
      correctWordDetails =
        allWords.find((wordDetail) =>
          wordDetail.grammaticalForms.includes(fallbackWord.toLowerCase())
        ) || null;
    }

    if (!correctWordDetails || !randomWord) {
      console.error("No valid question could be generated.");
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

    console.log(
      "Correct Word Details:",
      correctWordDetails.id,
      "Random Word:",
      randomWord
    );

    const otherOptions = await getRandomOptions(
      allWords,
      correctWordDetails.englishTranslation
    );
    console.log("Other Options:", otherOptions);

    const generatedQuestionType = getRandomQuestionType();
    console.log("Generated Question Type:", generatedQuestionType);

    let generatedSentenceText = "";
    let generatedQuestionText = "";
    let generatedOptions: string[] = [];
    const generatedTranslation = similarSentence.englishTranslation;
    const wordImage = correctWordDetails.imageUrl;
    let generatedCorrectAnswerText = toTitleCase(
      correctWordDetails.englishTranslation
    );

    if (generatedQuestionType === "multipleChoice") {
      generatedQuestionText = `What is the base form of **${toTitleCase(
        randomWord
      )}** in the sentence below?`;
      generatedSentenceText = similarSentence.sentence;
      generatedOptions = shuffleArray(
        [...otherOptions, generatedCorrectAnswerText].map(toTitleCase)
      );
    } else if (generatedQuestionType === "fillInTheBlank") {
      generatedQuestionText = `Complete the sentence:`;
      generatedSentenceText = similarSentence.sentence.replace(
        randomWord,
        "[...]"
      );
      generatedCorrectAnswerText = toTitleCase(randomWord);
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

    console.log("Generated Question Text:", generatedQuestionText);
    console.log("Generated Sentence Text:", generatedSentenceText);
    console.log("Generated Translation:", generatedTranslation);
    console.log("Word Image:", wordImage);
    console.log("Generated Correct Answer Text:", generatedCorrectAnswerText);
    console.log("Generated Options:", generatedOptions);

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
  const randomValue = Math.random();
  return randomValue < 0.45
    ? "multipleChoice"
    : randomValue < 0.85
    ? "fillInTheBlank"
    : "trueFalse";
};

export const getRandomOptions = async (
  words: Word[],
  correctAnswerText: string
): Promise<string[]> => {
  const numberPattern =
    /^(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion)([-\s]?)(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion)*$/i;

  const candidateWords = words
    .map((word) => word.englishTranslation)
    .filter((word) => !numberPattern.test(word.toLowerCase()));

  const similarityScores = getSimilarityScores(
    correctAnswerText,
    candidateWords
  );

  const sortedOptions = Array.from(similarityScores.entries())
    .filter(([word]) => word !== correctAnswerText)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);

  const topTwoOptions = sortedOptions.slice(0, 2);
  const remainingCandidates = candidateWords.filter(
    (word) => !topTwoOptions.includes(word) && word !== correctAnswerText
  );

  const randomOption = shuffleArray(remainingCandidates)[0];
  const finalOptions = shuffleArray([...topTwoOptions, randomOption]);

  console.log("Final Options:", finalOptions);

  return finalOptions;
};

function levenshtein(a: string, b: string): number {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] =
        b[i - 1] === a[j - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(
              matrix[i - 1][j - 1] + 1,
              Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
            );
    }
  }
  return matrix[b.length][a.length];
}

export const getSimilarityScores = (
  target: string,
  candidates: string[]
): Map<string, number> => {
  const similarityScores = new Map(
    candidates.map((candidate) => {
      const distance = levenshtein(target, candidate);
      return [candidate, 1 / (1 + distance)];
    })
  );

  console.log("Similarity Scores:");
  Array.from(similarityScores.entries()).forEach(([key, value], index) => {
    console.log(`${index + 1}. ${key}: ${value}`);
  });

  return similarityScores;
};
