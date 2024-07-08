// services/firebase/wordService.ts
import firestore from "@react-native-firebase/firestore";

export interface Word {
  id: string; // Document ID, which is the base form of the word
  grammaticalForms: string[]; // All known grammatical forms of the word
  englishTranslation: string; // Translation of the base form in English
  imageUrl: string; // URL of the image related to the word
  additionalInfo?: string; // Optional additional information
}

const fetchWords = async (): Promise<Word[]> => {
  const snapshot = await firestore().collection("words").get();
  const wordsData = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Word[];
  return wordsData;
};

const addWordForReview = async (wordData: Word): Promise<void> => {
  try {
    await firestore().collection("pendingWords").add(wordData);
  } catch (error) {
    console.error("Error adding word for review:", error);
    throw error;
  }
};

export default {
  fetchWords,
  addWordForReview,
};
