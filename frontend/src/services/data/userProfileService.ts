import apiClient from "@services/api/apiClient";
import {
  UserProfile,
  CreateUserProfileRequest,
  UpdateUserProfileRequest,
} from "@src/types";

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

const createUserProfile = async (
  request: CreateUserProfileRequest
): Promise<UserProfile | null> => {
  try {
    return await apiClient.createUserProfile(request);
  } catch (error) {
    console.error("Error creating user profile:", error);
    return null;
  }
};

const updateUserProfile = async (
  userId: string,
  request: UpdateUserProfileRequest
): Promise<UserProfile | null> => {
  try {
    return await apiClient.updateUserProfile(userId, request);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return null;
  }
};

const deleteUserProfile = async (userId: string): Promise<boolean> => {
  try {
    await apiClient.deleteUserProfile(userId);
    return true;
  } catch (error) {
    console.error("Error deleting user profile:", error);
    return false;
  }
};

const updateLastLogin = async (userId: string): Promise<boolean> => {
  try {
    await apiClient.updateLastLogin(userId);
    return true;
  } catch (error) {
    console.error("Error updating last login:", error);
    return false;
  }
};

export default {
  fetchUserProfile,
  createUserProfile,
  updateUserProfile,
  deleteUserProfile,
  updateLastLogin,
};
