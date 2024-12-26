import apiClient from "@services/api/apiClient";
import { WordForm, Lemma } from "@src/types";

const getWordForm = async (word: string): Promise<WordForm | null> => {
  try {
    return await apiClient.getWordForm(word);
  } catch (error) {
    console.error("Error fetching word form:", error);
    return null;
  }
};

const getLemma = async (lemma: string): Promise<Lemma | null> => {
  try {
    return await apiClient.getLemma(lemma);
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
