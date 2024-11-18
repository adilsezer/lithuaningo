import { COLLECTIONS } from "@config/constants";
import firestore from "@react-native-firebase/firestore";

// Fetch the user profile from Firestore
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

const getUserPremiumStatus = async (userId: string): Promise<boolean> => {
  const userProfile = await fetchUserProfile(userId);
  return userProfile?.isPremiumUser || false; // Default to false if not found
};

const updatePurchasedExtraContent = async (
  userId: string,
  isPremiumUser: boolean
): Promise<void> => {
  const userDocRef = firestore().collection(COLLECTIONS.USERS).doc(userId);
  const userDoc = await userDocRef.get();

  if (userDoc.exists) {
    await userDocRef.update({
      isPremiumUser: isPremiumUser,
    });
  } else {
    await userDocRef.set({
      isPremiumUser: isPremiumUser,
      // Add any other fields you might need here, e.g., createdAt, userName, etc.
    });
  }
};

// Fetch the most recent two learned sentences from the user profile
const getMostRecentTwoLearnedSentences = async (
  userId: string
): Promise<string[]> => {
  const userProfile = await fetchUserProfile(userId);
  const learnedSentences = userProfile?.learnedSentences || [];
  return learnedSentences.slice(-2);
};

export default {
  fetchUserProfile,
  getUserPremiumStatus,
  updatePurchasedExtraContent,
  getMostRecentTwoLearnedSentences,
};
