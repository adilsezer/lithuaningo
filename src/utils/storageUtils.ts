import AsyncStorage from "@react-native-async-storage/async-storage";
import { QUIZ_KEYS, SENTENCE_KEYS } from "@config/constants";
import { getCurrentDateKey } from "@utils/dateUtils";

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
    return null; // Default to null in case of error
  }
};

export const clearData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to clear data for key ${key}:`, error);
  }
};

// New function to reset all quiz-related keys
export const resetAllQuizKeys = async (userId: string): Promise<void> => {
  try {
    const dateKey = getCurrentDateKey();

    // Generate the actual keys by calling the key-generating functions
    const QUIZ_QUESTIONS_KEY = QUIZ_KEYS.QUIZ_QUESTIONS_KEY(userId, dateKey);
    const QUIZ_PROGRESS_KEY = QUIZ_KEYS.QUIZ_PROGRESS_KEY(userId, dateKey);
    const INCORRECT_QUESTIONS_KEY = QUIZ_KEYS.INCORRECT_QUESTIONS_KEY(
      userId,
      dateKey
    );
    const INCORRECT_PROGRESS_KEY = QUIZ_KEYS.INCORRECT_PROGRESS_KEY(
      userId,
      dateKey
    );
    const SESSION_STATE_KEY = QUIZ_KEYS.SESSION_STATE_KEY(userId, dateKey);
    const SENTENCES_COMPLETION_STATUS_KEY = SENTENCE_KEYS.COMPLETION_STATUS_KEY(
      userId,
      dateKey
    );
    const SENTENCES_KEY = SENTENCE_KEYS.SENTENCES_KEY(userId, dateKey);

    // Clear all the keys
    await clearData(QUIZ_QUESTIONS_KEY);
    await clearData(QUIZ_PROGRESS_KEY);
    await clearData(INCORRECT_QUESTIONS_KEY);
    await clearData(INCORRECT_PROGRESS_KEY);
    await clearData(SESSION_STATE_KEY);
    await clearData(SENTENCES_COMPLETION_STATUS_KEY);
    await clearData(SENTENCES_KEY);
  } catch (error) {
    console.error("Error resetting quiz-related keys:", error);
  }
};
