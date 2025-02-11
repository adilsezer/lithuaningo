import apiClient from "@services/api/apiClient";
import { WordForm, Lemma } from "@src/types";

const getWordForm = async (word: string): Promise<WordForm | null> => {
  try {
    const response = await apiClient.getWordForm(word);
    return response;
  } catch (error) {
    console.error("Error fetching word form:", error);
    return null;
  }
};

const getLemma = async (lemma: string): Promise<Lemma | null> => {
  try {
    const response = await apiClient.getLemma(lemma);
    return response;
  } catch (error) {
    console.error("Error fetching lemma:", error);
    return null;
  }
};

export default {
  getWordForm,
  getLemma,
};
//
