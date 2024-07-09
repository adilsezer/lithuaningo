import firestore from "@react-native-firebase/firestore";
import { Platform } from "react-native";
import Constants from "expo-constants";

export interface VersionInfo {
  latestVersion: string;
  mandatoryUpdate: boolean;
  updateUrl: string;
}

export const getLatestVersionInfo = async (): Promise<VersionInfo | null> => {
  try {
    const platform = Platform.OS;
    const doc = await firestore().collection("appVersions").doc(platform).get();
    if (doc.exists) {
      const data = doc.data();
      return {
        latestVersion: data?.latestVersion || "0.0.0",
        mandatoryUpdate: data?.mandatoryUpdate || false,
        updateUrl: data?.updateUrl || "",
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
