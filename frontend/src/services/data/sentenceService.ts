import apiClient from "@services/api/apiClient";
import { Sentence } from "@src/types";

const fetchSentences = async (userId: string): Promise<Sentence[]> => {
  try {
    return await apiClient.getSentences(userId);
  } catch (error) {
    console.error("Error fetching sentences:", error);
    return [];
  }
};

const getLearnedSentences = async (userId: string): Promise<Sentence[]> => {
  try {
    return await apiClient.getLearnedSentences(userId);
  } catch (error) {
    console.error("Error fetching learned sentences:", error);
    return [];
  }
};

const getLastNLearnedSentences = async (
  userId: string,
  count: number
): Promise<Sentence[]> => {
  try {
    return await apiClient.getLastNLearnedSentences(userId, count);
  } catch (error) {
    console.error("Error fetching last N learned sentences:", error);
    return [];
  }
};

const getRandomSentence = async (limit?: number): Promise<Sentence> => {
  try {
    return await apiClient.getRandomSentence(limit);
  } catch (error) {
    console.error("Error fetching random sentence:", error);
    throw error;
  }
};

export {
  fetchSentences,
  getLearnedSentences,
  getLastNLearnedSentences,
  getRandomSentence,
};
