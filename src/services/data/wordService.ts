// services/firebase/wordService.ts
import { COLLECTIONS } from "@config/constants";
import firestore from "@react-native-firebase/firestore";

export interface WordForm {
  lithuanian: string;
  english: string;
}

export interface Word {
  id: string; // Document ID, which is the base form of the word
  wordForms: WordForm[]; // All known forms of the word along with translations
  englishTranslation: string; // Translation of the base form in English
  imageUrl: string; // URL of the image related to the word
  additionalInfo?: string; // Optional additional information
}

const fetchWords = async (): Promise<Word[]> => {
  const snapshot = await firestore().collection(COLLECTIONS.WORDS).get();
  const wordsData = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Word[];
  return wordsData;
};

const addWordForReview = async (wordData: Word): Promise<void> => {
  try {
    await firestore().collection(COLLECTIONS.PENDING_WORDS).add(wordData);
  } catch (error) {
    console.error("Error adding word for review:", error);
    throw error;
  }
};

const addMissingWord = async (word: string): Promise<void> => {
  try {
    const docRef = firestore().collection(COLLECTIONS.MISSING_WORDS).doc(word);
    const doc = await docRef.get();

    if (!doc.exists) {
      await docRef.set({ id: word });
    }
  } catch (error) {
    console.error("Error adding missing word:", error);
    throw error;
  }
};

export default {
  fetchWords,
  addWordForReview,
  addMissingWord,
};
