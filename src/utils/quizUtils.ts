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
  console.log("Fetching words for grammatical forms map...");
  const words: Word[] = await wordService.fetchWords();
  const grammaticalFormsMap = new Map<string, string>();

  words.forEach((word: Word) => {
    word.grammatical_forms.forEach((form: string) => {
      grammaticalFormsMap.set(form, word.id);
    });
  });

  console.log("Grammatical forms map created:", grammaticalFormsMap);
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

export const getMostSimilarSentence = async (
  learnedSentence: Sentence,
  allSentences: Sentence[]
): Promise<Sentence> => {
  const grammaticalFormsMap = await createGrammaticalFormsMap();

  const learnedTokens = new Set(
    normalizeSentence(learnedSentence.sentence, grammaticalFormsMap)
  );
  console.log(
    `Normalized learned sentence to tokens: ${[...learnedTokens].join(", ")}`
  );

  let maxSimilarity = 0;
  let mostSimilarSentence = allSentences[0];

  for (const sentence of allSentences) {
    if (sentence.id === learnedSentence.id) continue; // Skip the same sentence

    const sentenceTokens = new Set(
      normalizeSentence(sentence.sentence, grammaticalFormsMap)
    );
    console.log(
      `Normalized sentence '${sentence.sentence}' to tokens: ${[
        ...sentenceTokens,
      ].join(", ")}`
    );

    const similarity = jaccardSimilarity(learnedTokens, sentenceTokens);
    console.log(
      `Comparing normalized learned sentence with normalized sentence: ${[
        ...sentenceTokens,
      ].join(" ")}\nSimilarity: ${similarity}`
    );

    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      mostSimilarSentence = sentence;
    }
  }

  console.log(`Most similar sentence: ${mostSimilarSentence.sentence}`);
  return mostSimilarSentence;
};

export const getRandomWord = (words: string[]): string => {
  return words[Math.floor(Math.random() * words.length)];
};

export const getRandomOptions = (
  words: Word[],
  correctAnswer: string
): string[] => {
  const options = words
    .map((word: Word) => word.english_translation)
    .filter((option: string) => option !== correctAnswer);
  return options.sort(() => 0.5 - Math.random()).slice(0, 3); // Get 3 random options
};
