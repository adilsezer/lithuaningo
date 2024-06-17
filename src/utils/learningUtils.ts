// src/utils/quizUtils.ts

import sentenceService, { Sentence } from "../services/data/sentenceService";
import wordService, { Word } from "../services/data/wordService";

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
    word.grammatical_forms.forEach((form: string) => {
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
  const stopwords = new Set([
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
  ]);

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

    // Log the comparison result
    console.log(
      `Comparing "${learnedSentence.sentence}" with "${sentence.sentence}"`
    );
    console.log(`Similarity Score: ${similarity}`);

    return { sentence, similarity };
  });

  // Sort sentences by similarity in descending order
  sentenceSimilarities.sort((a, b) => b.similarity - a.similarity);

  // Log the sorted results
  console.log("Sorted Similarities:");
  sentenceSimilarities.forEach(({ sentence, similarity }) => {
    console.log(`Sentence: "${sentence.sentence}", Similarity: ${similarity}`);
  });

  return sentenceSimilarities.map((item) => item.sentence);
};
//
export const getRandomOptions = (
  words: Word[],
  correctAnswer: string
): string[] => {
  const options = words
    .map((word: Word) => word.english_translation)
    .filter((option: string) => option !== correctAnswer);
  return options.sort(() => 0.5 - Math.random()).slice(0, 3); // Get 3 random options
};
