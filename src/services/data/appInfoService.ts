import firestore from "@react-native-firebase/firestore";
import { Platform } from "react-native";
import Constants from "expo-constants";

export interface AppInfo {
  latestVersion: string;
  mandatoryUpdate: boolean;
  updateUrl: string;
  isUnderMaintenance: boolean;
}

export const getLatestAppInfo = async (): Promise<AppInfo | null> => {
  try {
    const platform = Platform.OS;
    const doc = await firestore().collection("appInfo").doc(platform).get();
    if (doc.exists) {
      const data = doc.data();
      return {
        latestVersion: data?.latestVersion || "0.0.0",
        mandatoryUpdate: data?.mandatoryUpdate || false,
        updateUrl: data?.updateUrl || "",
        isUnderMaintenance: data?.isUnderMaintenance || false,
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching latest version:", error);
    return null;
  }
};

export const getCurrentVersion = (): string => {
  return Constants.expoConfig?.version || "0.0.0";
};
