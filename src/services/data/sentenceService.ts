import firestore from "@react-native-firebase/firestore";

export interface Sentence {
  id: string; // Document ID
  sentence: string; // The Lithuanian sentence
  englishTranslation: string; // Translation of the sentence in English
  isMainSentence: boolean; // True if the sentence is for the main learning screen, false if it's for quizzes
  displayOrder: number; // Optional order to display the sentence in the main learning screen
}

const fetchSentences = async (): Promise<Sentence[]> => {
  const snapshot = await firestore().collection("sentences").get();
  const sentencesData = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Sentence[];

  // Sort sentences by displayOrder, handling undefined values
  const sortedSentences = sentencesData.sort((a, b) => {
    if (a.displayOrder === undefined && b.displayOrder === undefined) return 0;
    if (a.displayOrder === undefined) return 1;
    if (b.displayOrder === undefined) return -1;
    return a.displayOrder - b.displayOrder;
  });

  return sortedSentences;
};

const fetchSentenceById = async (id: string): Promise<Sentence> => {
  const doc = await firestore().collection("sentences").doc(id).get();
  if (!doc.exists) {
    throw new Error("Sentence not found");
  }
  return { id: doc.id, ...doc.data() } as Sentence;
};

export default {
  fetchSentences,
  fetchSentenceById,
};
