import Constants from "expo-constants";
import apiClient, { ApiError } from "@services/api/apiClient";
import { AppInfo } from "@src/types";

export const getLatestAppInfo = async (): Promise<AppInfo | null> => {
  try {
    return await apiClient.getAppInfo();
  } catch (error) {
    if (error instanceof ApiError) {
      //crashlytics().recordError(error);
      console.error(`API Error ${error.status}:`, error.data);
    } else {
      console.error("Error fetching latest version:", error);
    }
    return null;
  }
};

export const getCurrentVersion = (): string => {
  return Constants.expoConfig?.version || "0.0.0";
};
