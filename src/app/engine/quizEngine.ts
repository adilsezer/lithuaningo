import sentenceService, { Sentence } from "../../services/data/sentenceService";
import wordService, { Word } from "../../services/data/wordService";
import { retrieveData } from "../../utils/storageUtils";
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

  console.log(
    "Learned Sentences:",
    learnedSentences.map((s: Sentence) => s.sentence)
  );

  const allSentences = await sentenceService.fetchAndShuffleSentences();
  const allWords = await wordService.fetchWords();

  return { learnedSentences, allSentences, allWords };
};

const getLearnedWordsDetails = (
  learnedSentences: Sentence[],
  allWords: Word[]
): Word[] => {
  const learnedWords = new Set<string>(
    learnedSentences.flatMap((sentence: Sentence) =>
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
    learnedWordsDetails.map((wd: Word) => wd.id)
  );

  return learnedWordsDetails;
};

export const loadQuizData = async (
  userData: any,
  setQuizState: React.Dispatch<React.SetStateAction<QuizState>>,
  QUIZ_PROGRESS_KEY: string
): Promise<void> => {
  if (!userData?.id) return;
  try {
    const { learnedSentences, allSentences, allWords } =
      await fetchLearnedAndAllSentencesWithWords(userData);

    const learnedWordsDetails = getLearnedWordsDetails(
      learnedSentences,
      allWords
    );
    const sentencesPerWord = Math.ceil(10 / learnedWordsDetails.length) + 2; // Increase to account for potential removals
    let allSelectedSentences: Sentence[] = [];

    learnedWordsDetails.forEach((wordDetail: Word) => {
      const relatedSentences = getRelatedSentences(allSentences, wordDetail);

      let selectedSentences =
        relatedSentences.length < sentencesPerWord
          ? relatedSentences
          : shuffleArray(relatedSentences).slice(0, sentencesPerWord);

      console.log(`Selected sentences for word: ${wordDetail.id}`);
      selectedSentences.forEach((sentence: Sentence) =>
        console.log(`- ${sentence.sentence}`)
      );

      allSelectedSentences.push(...selectedSentences);
    });

    allSelectedSentences = removeDuplicates(shuffleArray(allSelectedSentences));

    const finalSentences =
      allSelectedSentences.length >= 10
        ? allSelectedSentences.slice(0, 10)
        : allSelectedSentences;

    console.log("Final Sentences:");
    finalSentences.forEach((s: Sentence, index: number) => {
      console.log(`${index + 1}. ${s.sentence} (Selected for: ${s.relatedTo})`);
    });

    setQuizState((prev: QuizState) => ({
      ...prev,
      similarSentences: finalSentences,
    }));

    const storedProgress = await retrieveData<number>(QUIZ_PROGRESS_KEY);
    console.log("Stored Progress:", storedProgress);

    if (storedProgress !== null) {
      if (storedProgress >= finalSentences.length) {
        setQuizState((prev: QuizState) => ({ ...prev, quizCompleted: true }));
      } else {
        setQuizState((prev: QuizState) => ({
          ...prev,
          questionIndex: storedProgress,
        }));
        await loadQuestion(
          finalSentences[storedProgress],
          setQuizState,
          userData
        );
      }
    } else {
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
    console.log("Loading question for sentence:", similarSentence.sentence);

    const { learnedSentences, allWords } =
      await fetchLearnedAndAllSentencesWithWords(userData);
    const learnedWords = new Set<string>(
      learnedSentences.flatMap((sentence: Sentence) =>
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
      const fallbackWord = shuffleArray(similarSentenceWords)[0];
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

    setQuizState((prev: QuizState) => ({
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

export { initializeQuizState };

const shuffleArray = <T>(array: T[]): T[] =>
  array.sort(() => 0.5 - Math.random());
