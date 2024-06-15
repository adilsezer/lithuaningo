// services/firebase/sentenceService.ts
import firestore from "@react-native-firebase/firestore";

export interface Sentence {
  id: string; // Document ID
  sentence: string; // The Lithuanian sentence
  english_translation: string; // Translation of the sentence in English
  is_main_sentence: boolean; // True if the sentence is for the main learning screen, false if it's for quizzes
  display_order?: number; // Optional order to display the sentence in the main learning screen
}

const fetchSentences = async (): Promise<Sentence[]> => {
  const snapshot = await firestore().collection("sentences").get();
  const sentencesData = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Sentence[];
  return sentencesData;
};

export default {
  fetchSentences,
};
