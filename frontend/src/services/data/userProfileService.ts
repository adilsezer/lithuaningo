import apiClient from "@services/api/apiClient";
import { UserProfile } from "@src/types";

const fetchUserProfile = async (
  userId: string
): Promise<UserProfile | null> => {
  try {
    return await apiClient.getUserProfile(userId);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export default {
  fetchUserProfile,
};
