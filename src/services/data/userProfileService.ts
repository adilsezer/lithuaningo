// services/firebase/userProfileService.ts
import firestore from "@react-native-firebase/firestore";

const fetchUserProfile = async (userId: string) => {
  const userDoc = await firestore()
    .collection("userProfiles")
    .doc(userId)
    .get();
  if (!userDoc.exists) {
    throw new Error("User profile not found");
  }
  return userDoc.data();
};

const updateUserLearnedSentences = async (
  userId: string,
  newLearnedSentenceIds: string[]
): Promise<void> => {
  try {
    const userProfile = await fetchUserProfile(userId);
    const existingLearnedSentences = userProfile?.learnedSentences || [];

    const updatedLearnedSentences = [
      ...new Set([...existingLearnedSentences, ...newLearnedSentenceIds]),
    ];

    await firestore().collection("userProfiles").doc(userId).update({
      learnedSentences: updatedLearnedSentences,
    });
  } catch (error) {
    console.error("Error updating learned sentences:", error);
    throw new Error("Failed to update learned sentences.");
  }
};

export default {
  fetchUserProfile,
  updateUserLearnedSentences,
};
