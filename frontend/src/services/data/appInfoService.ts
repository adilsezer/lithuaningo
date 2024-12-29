import Constants from "expo-constants";
import apiClient from "@services/api/apiClient";
import { AppInfo } from "@src/types";

export const getLatestAppInfo = async (): Promise<AppInfo | null> => {
  try {
    console.log("Fetching latest app info");
    return await apiClient.getAppInfo();
  } catch (error) {
    console.error("Error fetching latest version:", error);
    return null;
  }
};

export const getCurrentVersion = (): string => {
  return Constants.expoConfig?.version || "0.0.0";
};
