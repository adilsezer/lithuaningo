// services/firebase/wordService.ts
import firestore from "@react-native-firebase/firestore";

export interface Word {
  id: string; // Document ID, which is the base form of the word
  grammatical_forms: string[]; // All known grammatical forms of the word
  english_translation: string; // Translation of the base form in English
  image_url: string; // URL of the image related to the word
  additional_info?: string; // Optional additional information
}

const fetchWords = async (): Promise<Word[]> => {
  const snapshot = await firestore().collection("words").get();
  const wordsData = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Word[];
  return wordsData;
};

export default {
  fetchWords,
};
