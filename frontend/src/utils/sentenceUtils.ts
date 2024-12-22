import { Sentence } from "../services/data/sentenceService";
import { Word } from "../services/data/wordService";
import { getSkippedWords } from "./quizUtils";
import { cleanWord } from "./stringUtils";

export const removeDuplicates = (sentences: Sentence[]): Sentence[] => {
  const seenSentences = new Set<string>();
  const uniqueSentences = sentences.filter((sentence) => {
    if (seenSentences.has(sentence.sentence)) {
      return false;
    }
    seenSentences.add(sentence.sentence);
    return true;
  });

  return uniqueSentences;
};

const findRelatedSentencesIgnoringPrefix = (
  allSentences: Sentence[],
  wordDetail: Word
): Sentence[] => {
  const skippedWords = new Set(
    getSkippedWords().map((word) => cleanWord(word).toLowerCase())
  );

  const relatedSentences = allSentences
    .filter((sentence) =>
      sentence.sentence.split(" ").some((word) => {
        const cleanedWord = cleanWord(word).toLowerCase();

        // Skip if any word form is in the skipped words
        if (
          wordDetail.wordForms.some((form) =>
            skippedWords.has(form.lithuanian.toLowerCase())
          )
        ) {
          return false;
        }

        const isRelated = wordDetail.wordForms.some(
          (form) => cleanedWord === form.lithuanian.toLowerCase()
        );

        return isRelated;
      })
    )
    .map((sentence) => ({ ...sentence }));

  // Shuffle the related sentences
  for (let i = relatedSentences.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [relatedSentences[i], relatedSentences[j]] = [
      relatedSentences[j],
      relatedSentences[i],
    ];
  }

  return relatedSentences;
};

export const getRelatedSentences = (
  allSentences: Sentence[],
  wordDetail: Word
): Sentence[] => {
  let relatedSentences = findRelatedSentencesIgnoringPrefix(
    allSentences,
    wordDetail
  );

  // If no related sentences are found and the word starts with 'ne'
  if (
    relatedSentences.length === 0 &&
    wordDetail.id.toLowerCase().startsWith("ne")
  ) {
    const wordWithoutPrefix = { ...wordDetail, id: wordDetail.id.slice(2) };
    relatedSentences = findRelatedSentencesIgnoringPrefix(
      allSentences,
      wordWithoutPrefix
    ).map((sentence) => ({
      ...sentence,
    }));
  }

  return relatedSentences;
};
