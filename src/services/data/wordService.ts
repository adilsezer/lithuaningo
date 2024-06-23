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

const fetchWordByGrammaticalForm = async (
  form: string
): Promise<Word | null> => {
  const normalizedForm = form.toLowerCase();

  // Fetch all words (consider fetching only once and reusing the data if the dataset is large)
  const snapshot = await firestore().collection("words").get();

  if (snapshot.empty) {
    return null;
  }

  for (const doc of snapshot.docs) {
    const wordData = doc.data();
    const grammaticalForms = wordData.grammaticalForms.map((f: string) =>
      f.toLowerCase()
    );
    if (grammaticalForms.includes(normalizedForm)) {
      return { id: doc.id, ...wordData } as Word;
    }
  }

  return null;
};

export default {
  fetchWords,
  fetchWordByGrammaticalForm,
};
