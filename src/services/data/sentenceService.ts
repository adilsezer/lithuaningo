import firestore from "@react-native-firebase/firestore";

export interface Sentence {
  id: string; // Document ID
  sentence: string; // The Lithuanian sentence
  englishTranslation: string; // Translation of the sentence in English
  isMainSentence: boolean; // True if the sentence is for the main learning screen, false if it's for quizzes
  displayOrder: number; // Optional order to display the sentence in the main learning screen
}

const fetchAndShuffleSentences = async (): Promise<Sentence[]> => {
  const snapshot = await firestore().collection("sentences").get();
  const sentencesData = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Sentence[];

  // Shuffle the sentences
  for (let i = sentencesData.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sentencesData[i], sentencesData[j]] = [sentencesData[j], sentencesData[i]];
  }

  return sentencesData;
};

export default {
  fetchAndShuffleSentences,
};
