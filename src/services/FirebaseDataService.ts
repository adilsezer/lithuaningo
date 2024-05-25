import firestore from "@react-native-firebase/firestore";

export interface LearningCard {
  type: "multiple_choice" | "fill_in_the_blank" | "true_false";
  question: string;
  image?: string;
  options?: string[];
  correctAnswer?: string;
}

export const fetchLearningCards = async (): Promise<LearningCard[]> => {
  try {
    const snapshot = await firestore().collection("learningCards").get();
    return snapshot.docs.map((doc) => doc.data() as LearningCard);
  } catch (error) {
    console.error("Error fetching learning cards:", error);
    throw new Error(
      `Failed to fetch learning cards: ${(error as Error).message}`
    );
  }
};
