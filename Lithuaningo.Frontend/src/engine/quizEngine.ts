import wordService, { Word } from "../services/data/wordService";
import { retrieveData, storeData } from "../utils/storageUtils";
import { toTitleCase, cleanWord } from "../utils/stringUtils";
import { getCurrentDateKey } from "../utils/dateUtils";
import { initializeQuizState, QuizState } from "../state/quizState";
import {
  getSkippedWords,
  getRandomQuestionType,
  getRandomOptions,
} from "../utils/quizUtils";
import { removeDuplicates, getRelatedSentences } from "../utils/sentenceUtils";
import sentenceService from "../services/data/sentenceService";
import { SENTENCE_KEYS } from "@config/constants";

export interface QuizQuestion {
  questionText: string;
  sentenceText: string;
  correctAnswerText: string;
  translation: string;
  image: string;
  options: string[];
  questionType: "multipleChoice" | "fillInTheBlank" | "trueFalse";
  questionWord: string;
}

const fetchLearnedAndAllSentencesWithWords = async (
  userData: any
): Promise<{
  learnedSentences: any[];
  allSentences: any[];
  allWords: Word[];
}> => {
  const SENTENCES_KEY = SENTENCE_KEYS.SENTENCES_KEY(
    userData?.id,
    getCurrentDateKey()
  );
  const learnedSentences = await retrieveData<any[]>(SENTENCES_KEY);

  if (!learnedSentences) {
    throw new Error("No learned sentences found.");
  }

  const allSentences = await sentenceService.fetchSentences(userData?.id);
  const allWords = await wordService.fetchWords();

  return { learnedSentences, allSentences, allWords };
};

const findWordDetailsIgnoringPrefix = (
  word: string,
  allWords: Word[]
): Word | null => {
  const foundWord =
    allWords.find((wordDetail) =>
      wordDetail.wordForms.some(
        (form) => form.lithuanian.toLowerCase() === word.toLowerCase()
      )
    ) || null;
  return foundWord;
};

const getLearnedWordsDetails = (
  learnedSentences: any[],
  allWords: Word[]
): Word[] => {
  const skippedWords = new Set(
    getSkippedWords().map((word) => cleanWord(word).toLowerCase())
  );
  const learnedWords = new Set<string>(
    learnedSentences.flatMap((sentence: any) =>
      sentence.sentence
        .split(" ")
        .map((word: string) => cleanWord(word).toLowerCase())
        .filter((word: string) => !skippedWords.has(word))
    )
  );

  const learnedWordsDetails = Array.from(learnedWords)
    .flatMap((word) => {
      let wordDetail = findWordDetailsIgnoringPrefix(word, allWords);

      if (!wordDetail && word.toLowerCase().startsWith("ne")) {
        const wordWithoutPrefix = word.slice(2);
        wordDetail = findWordDetailsIgnoringPrefix(wordWithoutPrefix, allWords);
      }

      return wordDetail ? [wordDetail] : [];
    })
    .filter((wordDetail): wordDetail is Word => !!wordDetail);

  return learnedWordsDetails;
};

export const loadQuizData = async (
  userData: any,
  setQuestions: React.Dispatch<React.SetStateAction<QuizQuestion[]>>,
  setQuizState: React.Dispatch<React.SetStateAction<QuizState>>,
  QUESTIONS_KEY: string,
  QUIZ_PROGRESS_KEY: string
): Promise<void> => {
  if (!userData?.id) return;

  try {
    // Check if questions are already stored
    const storedQuestions = await retrieveData<QuizQuestion[]>(QUESTIONS_KEY);

    if (storedQuestions && storedQuestions.length > 0) {
      setQuestions(storedQuestions);
      const storedProgress = await retrieveData<number>(QUIZ_PROGRESS_KEY);
      setQuizState((prev: QuizState) => ({
        ...prev,
        questionIndex: storedProgress ?? 0,
        quizCompleted:
          storedProgress !== null && storedProgress >= storedQuestions.length,
      }));
    } else {
      const { learnedSentences, allSentences, allWords } =
        await fetchLearnedAndAllSentencesWithWords(userData);

      const learnedWordsDetails = getLearnedWordsDetails(
        learnedSentences,
        allWords
      );

      const sentencesPerWord = Math.ceil(10 / learnedWordsDetails.length) + 2;
      let allSelectedSentences: any[] = [];

      learnedWordsDetails.forEach((wordDetail: Word) => {
        const relatedSentences = getRelatedSentences(allSentences, wordDetail);
        let selectedSentences =
          relatedSentences.length < sentencesPerWord
            ? relatedSentences
            : shuffleArray(relatedSentences).slice(0, sentencesPerWord);

        allSelectedSentences.push(...selectedSentences);
      });

      allSelectedSentences = removeDuplicates(
        shuffleArray(allSelectedSentences)
      );
      let finalSentences =
        allSelectedSentences.length >= 10
          ? allSelectedSentences.slice(0, 10)
          : allSelectedSentences;
      if (finalSentences.length === 0) {
        finalSentences = shuffleArray(allSentences).slice(0, 10);
      }

      const generatedQuestions = await Promise.all(
        finalSentences.map((sentence) =>
          generateQuestion(sentence, userData, allWords)
        )
      );

      setQuestions(generatedQuestions);
      await storeData(QUESTIONS_KEY, generatedQuestions);
      setQuizState((prev: QuizState) => ({
        ...prev,
        questionIndex: 0,
        quizCompleted: false,
      }));
    }
  } catch (error) {
    console.error("Error loading quiz data:", error);
  }
};

const generateQuestion = async (
  similarSentence: any,
  userData: any,
  allWords: Word[]
): Promise<QuizQuestion> => {
  try {
    const { learnedSentences } = await fetchLearnedAndAllSentencesWithWords(
      userData
    );

    const learnedWords = new Set<string>(
      learnedSentences.flatMap((sentence: any) =>
        sentence.sentence
          .split(" ")
          .map((word: string) => cleanWord(word).toLowerCase())
      )
    );

    const similarSentenceWords = similarSentence.sentence
      .split(" ")
      .map((word: string) => cleanWord(word).toLowerCase());

    const skippedWords = new Set(
      getSkippedWords().map((word) => word.toLowerCase())
    );
    const validWords = similarSentenceWords.filter((word: string) =>
      allWords.some((wordDetail) => {
        const forms = wordDetail.wordForms.map((form) =>
          form.lithuanian.toLowerCase()
        );
        const hasLearnedForm = forms.some((form) => learnedWords.has(form));
        const hasLearnedFormWithNePrefix = forms.some((form) =>
          Array.from(learnedWords).some(
            (learnedWord) =>
              learnedWord.startsWith("ne") && learnedWord.slice(2) === form
          )
        );

        return (
          forms.includes(word.toLowerCase()) &&
          (hasLearnedForm || hasLearnedFormWithNePrefix) &&
          !forms.some((form) => skippedWords.has(form))
        );
      })
    );

    const shuffledWords = shuffleArray(validWords);

    let randomWord: string | undefined = undefined;
    let correctWordDetails: Word | null = null;
    let correctForm: string | undefined = undefined;

    for (const word of shuffledWords) {
      randomWord = word as string; // Ensure word is treated as string
      correctWordDetails =
        allWords.find((wordDetail) =>
          wordDetail.wordForms.some((form) => {
            if (
              form.lithuanian.toLowerCase() === (word as string).toLowerCase()
            ) {
              correctForm = form.english;
              return true;
            }
            return false;
          })
        ) || null;
      if (correctWordDetails) break;
    }

    if (!correctWordDetails) {
      const fallbackWord =
        shuffleArray(similarSentenceWords).find((fw) =>
          allWords.some((wordDetail) =>
            wordDetail.wordForms.some((form) => {
              if (
                form.lithuanian.toLowerCase() === (fw as string).toLowerCase()
              ) {
                correctForm = form.english;
                return true;
              }
              return false;
            })
          )
        ) || (shuffleArray(similarSentenceWords)[0] as string);
      randomWord = fallbackWord as string; // Ensure fallbackWord is treated as string
      correctWordDetails =
        allWords.find((wordDetail) =>
          wordDetail.wordForms.some((form) => {
            if (
              form.lithuanian.toLowerCase() ===
              (fallbackWord as string).toLowerCase()
            ) {
              correctForm = form.english;
              return true;
            }
            return false;
          })
        ) || null;
    }

    if (!correctWordDetails || !randomWord || !correctForm) {
      console.error("No valid question could be generated.");
      return {
        questionText: "",
        sentenceText:
          "No valid question could be generated. Please go back and try again.",
        correctAnswerText: "",
        translation: "",
        image: "",
        options: [],
        questionType: "multipleChoice",
        questionWord: "",
      };
    }

    // Strip out additional grammatical details from the correct answer
    const stripGrammarDetails = (text: string) =>
      text.replace(/\s*\(.*?\)\s*/g, "");

    const cleanCorrectForm = correctForm
      ? stripGrammarDetails(correctForm)
      : "";

    const otherOptions = await getRandomOptions(allWords, cleanCorrectForm);

    const generatedQuestionType = getRandomQuestionType();

    let generatedSentenceText = "";
    let generatedQuestionText = "";
    let generatedOptions: string[] = [];
    const generatedTranslation = similarSentence.englishTranslation;
    const wordImage = correctWordDetails.imageUrl;
    let generatedCorrectAnswerText = toTitleCase(cleanCorrectForm);
    let generatedQuestionWord = toTitleCase(randomWord);

    if (generatedQuestionType === "multipleChoice") {
      generatedQuestionText = `What does "**${generatedQuestionWord}**" mean in the sentence below?`;
      generatedSentenceText = similarSentence.sentence;
      generatedOptions = shuffleArray(
        [...otherOptions, generatedCorrectAnswerText].map(toTitleCase)
      );
    } else if (generatedQuestionType === "fillInTheBlank") {
      generatedQuestionText = `Complete the sentence:`;

      generatedSentenceText = similarSentence.sentence
        .split(" ")
        .map((wordInSentence: string) => {
          // Strip punctuation from the word in the sentence for comparison
          let strippedWord = cleanWord(wordInSentence.toLowerCase());

          // Check if the stripped word matches the randomWord
          if (strippedWord === randomWord) {
            // Preserve the punctuation
            let punctuation = wordInSentence.slice(strippedWord.length);
            return "[...]" + punctuation;
          } else {
            return wordInSentence;
          }
        })
        .join(" ");

      generatedCorrectAnswerText = generatedQuestionWord;
    } else if (generatedQuestionType === "trueFalse") {
      const randomBool = Math.random() > 0.5;
      const givenTranslation = randomBool
        ? generatedCorrectAnswerText
        : otherOptions[0];
      generatedQuestionText = `Does "**${generatedQuestionWord}**" mean "**${toTitleCase(
        givenTranslation
      )}**" in the following sentence?`;
      generatedSentenceText = similarSentence.sentence;
      generatedCorrectAnswerText = randomBool ? "True" : "False";
      generatedOptions = ["True", "False"];
    }

    return {
      questionText: generatedQuestionText,
      sentenceText: generatedSentenceText,
      translation: generatedTranslation,
      image: wordImage,
      correctAnswerText: generatedCorrectAnswerText,
      options: generatedOptions,
      questionType: generatedQuestionType,
      questionWord: generatedQuestionWord,
    };
  } catch (error) {
    console.error("Error generating question:", error);
    throw error;
  }
};

export { initializeQuizState };

const shuffleArray = <T>(array: T[]): T[] =>
  array.sort(() => 0.5 - Math.random());
