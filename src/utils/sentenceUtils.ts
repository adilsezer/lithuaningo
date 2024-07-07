import { Sentence } from "../services/data/sentenceService";
import { Word } from "../services/data/wordService";
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
  const relatedSentences = allSentences
    .filter((sentence) =>
      sentence.sentence
        .split(" ")
        .some((word) =>
          wordDetail.grammaticalForms.includes(cleanWord(word).toLowerCase())
        )
    )
    .map((sentence) => ({ ...sentence, relatedTo: wordDetail.id }));

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
      relatedTo: wordDetail.id, // Keep the original id with 'ne' prefix
    }));
  }

  return relatedSentences;
};
