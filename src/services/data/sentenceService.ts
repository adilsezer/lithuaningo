import { COLLECTIONS } from "@config/constants";
import firestore from "@react-native-firebase/firestore";

export interface Sentence {
  id: string; // Document ID
  sentence: string; // The Lithuanian sentence
  englishTranslation: string; // Translation of the sentence in English
  isMainSentence: boolean; // True if the sentence is for the main learning screen, false if it's for quizzes
  displayOrder: number; // Optional order to display the sentence in the main learning screen
}

const fetchSentences = async (
  userId: string,
  updateIndex: boolean = false
): Promise<Sentence[]> => {
  // Function to shuffle an array
  const shuffleArray = (array: Sentence[]): Sentence[] => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // Function to fetch all sentences and shuffle them
  const fetchAndShuffleAllSentences = async (): Promise<Sentence[]> => {
    const snapshot = await firestore().collection(COLLECTIONS.SENTENCES).get();
    const sentencesData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Sentence[];
    return shuffleArray(sentencesData);
  };

  // If updateIndex is false, just fetch and shuffle all sentences
  if (!updateIndex) {
    return fetchAndShuffleAllSentences();
  }

  // Fetch user document and currentSentenceIndex
  const userDocRef = firestore().collection(COLLECTIONS.USERS).doc(userId);
  const userDoc = await userDocRef.get();
  const currentSentenceIndex = userDoc.exists
    ? userDoc.data()?.currentSentenceIndex || 0
    : 0;

  // Fetch sentences with a displayOrder greater than the currentSentenceIndex
  let snapshot = await firestore()
    .collection(COLLECTIONS.SENTENCES)
    .where("displayOrder", ">", currentSentenceIndex)
    .orderBy("displayOrder")
    .get();

  let sentencesData = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Sentence[];

  // If fewer than 2 sentences are found, fetch and shuffle all sentences
  if (sentencesData.length < 2) {
    sentencesData = await fetchAndShuffleAllSentences();
  }

  // Update currentSentenceIndex if needed
  if (updateIndex && sentencesData.length > 0) {
    const lastSentenceToBeDisplayed = sentencesData[1];
    await userDocRef.update({
      currentSentenceIndex: lastSentenceToBeDisplayed.displayOrder,
    });
  }

  return sentencesData;
};

export default {
  fetchSentences,
};
