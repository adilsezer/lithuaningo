import { COLLECTIONS } from "@config/constants";
import firestore from "@react-native-firebase/firestore";

const fetchUserProfile = async (userId: string) => {
  const userDoc = await firestore()
    .collection(COLLECTIONS.USERS)
    .doc(userId)
    .get();
  if (!userDoc.exists) {
    throw new Error("User profile not found");
  }
  return userDoc.data();
};

const getMostRecentTwoLearnedSentences = async (
  userId: string
): Promise<string[]> => {
  const userProfile = await fetchUserProfile(userId);
  const learnedSentences = userProfile?.learnedSentences || [];
  return learnedSentences.slice(-2);
};

export default {
  fetchUserProfile,
  getMostRecentTwoLearnedSentences,
};
