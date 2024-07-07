import { Word } from "../services/data/wordService";

export const getSkippedWords = (): string[] => [
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

  return finalOptions;
};

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

  return similarityScores;
};

const levenshtein = (a: string, b: string): number => {
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
};

const shuffleArray = <T>(array: T[]): T[] =>
  array.sort(() => 0.5 - Math.random());
