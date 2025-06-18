import AsyncStorage from "@react-native-async-storage/async-storage";

export const storeData = async <T>(key: string, value: T): Promise<void> => {
  try {
    const stringValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, stringValue);
  } catch (error) {
    // Only log keys in development to avoid revealing sensitive data structure
    if (__DEV__) {
      console.error(`Failed to store data for key ${key}:`, error);
    } else {
      console.error(
        "Failed to store data:",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
};

export const retrieveData = async <T>(key: string): Promise<T | null> => {
  try {
    const stringValue = await AsyncStorage.getItem(key);
    return stringValue != null ? JSON.parse(stringValue) : null;
  } catch (error) {
    // Only log keys in development to avoid revealing sensitive data structure
    if (__DEV__) {
      console.error(`Failed to retrieve data for key ${key}:`, error);
    } else {
      console.error(
        "Failed to retrieve data:",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
    return null;
  }
};

export const clearData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    // Only log keys in development to avoid revealing sensitive data structure
    if (__DEV__) {
      console.error(`Failed to clear data for key ${key}:`, error);
    } else {
      console.error(
        "Failed to clear data:",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
};
