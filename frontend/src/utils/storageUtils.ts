import AsyncStorage from "@react-native-async-storage/async-storage";

export const storeData = async <T>(key: string, value: T): Promise<void> => {
  try {
    const stringValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, stringValue);
  } catch (error) {
    console.error(`Failed to store data for key ${key}:`, error);
  }
};

export const retrieveData = async <T>(key: string): Promise<T | null> => {
  try {
    const stringValue = await AsyncStorage.getItem(key);
    return stringValue != null ? JSON.parse(stringValue) : null;
  } catch (error) {
    console.error(`Failed to retrieve data for key ${key}:`, error);
    return null;
  }
};

export const clearData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to clear data for key ${key}:`, error);
  }
};
