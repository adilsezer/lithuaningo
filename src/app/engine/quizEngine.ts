import sentenceService, { Sentence } from "../../services/data/sentenceService";
import wordService, { Word } from "../../services/data/wordService";
import { retrieveData, storeData } from "../../utils/storageUtils";
import { toTitleCase, cleanWord } from "../../utils/stringUtils";
import { getCurrentDateKey } from "../../utils/dateUtils";
import { initializeQuizState, QuizState } from "../../state/quizState";
import {
  getSkippedWords,
  getRandomQuestionType,
  getRandomOptions,
} from "../../utils/quizUtils";
import {
  removeDuplicates,
  getRelatedSentences,
} from "../../utils/sentenceUtils";

const fetchLearnedAndAllSentencesWithWords = async (
  userData: any
): Promise<{
  learnedSentences: Sentence[];
  allSentences: Sentence[];
  allWords: Word[];
}> => {
  const SENTENCES_KEY = `sentences_${userData?.id}_${getCurrentDateKey()}`;
  const learnedSentences = await retrieveData<Sentence[]>(SENTENCES_KEY);

  if (!learnedSentences) {
    throw new Error("No learned sentences found.");
  }

  const allSentences = await sentenceService.fetchAndShuffleSentences();
  const allWords = await wordService.fetchWords();

  return { learnedSentences, allSentences, allWords };
};

const findWordDetailsIgnoringPrefix = (
  word: string,
  allWords: Word[]
): Word | null => {
  return (
    allWords.find((wordDetail) =>
      wordDetail.grammaticalForms.includes(word.toLowerCase())
    ) || null
  );
};

const getLearnedWordsDetails = (
  learnedSentences: Sentence[],
  allWords: Word[]
): Word[] => {
  const skippedWords = new Set(
    getSkippedWords().map((word) => cleanWord(word).toLowerCase())
  );
  const learnedWords = new Set<string>(
    learnedSentences.flatMap((sentence: Sentence) =>
      sentence.sentence
        .split(" ")
        .map((word) => cleanWord(word).toLowerCase())
        .filter((word) => !skippedWords.has(word))
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
  setSentences: React.Dispatch<React.SetStateAction<Sentence[]>>,
  setQuizState: React.Dispatch<React.SetStateAction<QuizState>>,
  QUIZ_PROGRESS_KEY: string
): Promise<void> => {
  if (!userData?.id) return;

  const QUESTIONS_KEY = `questions_${userData?.id}_${getCurrentDateKey()}`;
  try {
    // Check if questions are already stored
    const storedQuestions = await retrieveData<Sentence[]>(QUESTIONS_KEY);

    if (storedQuestions && storedQuestions.length > 0) {
      setSentences(storedQuestions);
      const storedProgress = await retrieveData<number>(QUIZ_PROGRESS_KEY);
      setQuizState((prev: QuizState) => ({
        ...prev,
        questionIndex: storedProgress ?? 0,
        quizCompleted:
          storedProgress !== null && storedProgress >= storedQuestions.length,
      }));
      if (storedProgress !== null && storedProgress < storedQuestions.length) {
        await loadQuestion(
          storedQuestions[storedProgress],
          setQuizState,
          userData
        );
      }
    } else {
      const { learnedSentences, allSentences, allWords } =
        await fetchLearnedAndAllSentencesWithWords(userData);
      const learnedWordsDetails = getLearnedWordsDetails(
        learnedSentences,
        allWords
      );
      const sentencesPerWord = Math.ceil(10 / learnedWordsDetails.length) + 2;
      let allSelectedSentences: Sentence[] = [];

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

      setSentences(finalSentences);
      await storeData(QUESTIONS_KEY, finalSentences);
      await loadQuestion(finalSentences[0], setQuizState, userData);
    }
  } catch (error) {
    console.error("Error loading quiz data:", error);
  }
};

export const loadQuestion = async (
  similarSentence: Sentence,
  setQuizState: React.Dispatch<React.SetStateAction<QuizState>>,
  userData: any
): Promise<void> => {
  try {
    const { learnedSentences, allWords } =
      await fetchLearnedAndAllSentencesWithWords(userData);
    const learnedWords = new Set<string>(
      learnedSentences.flatMap((sentence: Sentence) =>
        sentence.sentence
          .split(" ")
          .map((word) => cleanWord(word).toLowerCase())
      )
    );

    const similarSentenceWords = similarSentence.sentence
      .split(" ")
      .map((word) => cleanWord(word).toLowerCase());

    const skippedWords = new Set(
      getSkippedWords().map((word) => word.toLowerCase())
    );
    const validWords = similarSentenceWords.filter((word) =>
      allWords.some((wordDetail) => {
        const forms = wordDetail.grammaticalForms.map((form) =>
          form.toLowerCase()
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

    for (const word of shuffledWords) {
      randomWord = word;
      correctWordDetails =
        allWords.find((wordDetail) =>
          wordDetail.grammaticalForms.includes(word.toLowerCase())
        ) || null;
      if (correctWordDetails) break;
    }

    if (!correctWordDetails) {
      const fallbackWord =
        shuffleArray(similarSentenceWords).find((fw) =>
          allWords.some((wordDetail) =>
            wordDetail.grammaticalForms.includes(fw.toLowerCase())
          )
        ) || shuffleArray(similarSentenceWords)[0];
      randomWord = fallbackWord;
      correctWordDetails =
        allWords.find((wordDetail) =>
          wordDetail.grammaticalForms.includes(fallbackWord.toLowerCase())
        ) || null;
    }

    if (!correctWordDetails || !randomWord) {
      console.error("No valid question could be generated.");
      setQuizState((prev: QuizState) => ({
        ...prev,
        sentenceText:
          "No valid question could be generated. Please go back and try again.",
        questionText: "",
        translation: "",
        image: "",
        options: [],
      }));
      return;
    }

    const otherOptions = await getRandomOptions(
      allWords,
      correctWordDetails.englishTranslation
    );

    const generatedQuestionType = getRandomQuestionType();

    let generatedSentenceText = "";
    let generatedQuestionText = "";
    let generatedOptions: string[] = [];
    const generatedTranslation = similarSentence.englishTranslation;
    const wordImage = correctWordDetails.imageUrl;
    let generatedCorrectAnswerText = toTitleCase(
      correctWordDetails.englishTranslation
    );

    if (generatedQuestionType === "multipleChoice") {
      generatedQuestionText = `What is the English base form of "**${toTitleCase(
        randomWord
      )}**" in the following sentence?`;
      generatedSentenceText = similarSentence.sentence;
      generatedOptions = shuffleArray(
        [...otherOptions, generatedCorrectAnswerText].map(toTitleCase)
      );
    } else if (generatedQuestionType === "fillInTheBlank") {
      generatedQuestionText = `Complete the sentence:`;

      generatedSentenceText = similarSentence.sentence
        .split(" ")
        .map((wordInSentence) => {
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

      generatedCorrectAnswerText = toTitleCase(randomWord);
    } else if (generatedQuestionType === "trueFalse") {
      const randomBool = Math.random() > 0.5;
      const givenTranslation = randomBool
        ? generatedCorrectAnswerText
        : otherOptions[0];
      generatedQuestionText = `Does the English base form of "**${toTitleCase(
        randomWord
      )}**" mean "**${toTitleCase(
        givenTranslation
      )}**" in the following sentence?`;
      generatedSentenceText = similarSentence.sentence;
      generatedCorrectAnswerText = randomBool ? "True" : "False";
      generatedOptions = ["True", "False"];
    }

    setQuizState((prev: QuizState) => ({
      ...prev,
      questionText: generatedQuestionText,
      sentenceText: generatedSentenceText,
      translation: generatedTranslation,
      image: wordImage,
      correctAnswerText: generatedCorrectAnswerText,
      options: generatedOptions,
      questionType: generatedQuestionType,
    }));
  } catch (error) {
    console.error("Error loading question:", error);
  }
};

export { initializeQuizState };

const shuffleArray = <T>(array: T[]): T[] =>
  array.sort(() => 0.5 - Math.random());
