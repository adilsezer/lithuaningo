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

  console.log("Unique Sentences:");
  uniqueSentences.forEach((s, index) => {
    console.log(`${index + 1}. ${s.sentence}`);
  });

  return uniqueSentences;
};

export const getRelatedSentences = (
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

  console.log("Related Sentences for word:", wordDetail.id);
  relatedSentences.forEach((s, index) => {
    console.log(`${index + 1}. ${s.sentence}`);
  });

  return relatedSentences;
};
