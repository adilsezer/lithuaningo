import { useState, useCallback } from "react";
import {
  useIsLoading,
  useSetLoading,
  useError,
  useSetError,
} from "@stores/useUIStore";
import { WordForm, Lemma } from "@src/types";
import apiClient from "@services/api/apiClient";
import { retrieveData } from "@utils/storageUtils";
import { getCurrentDateKey } from "@utils/dateUtils";
import { useAlertDialog } from "@components/ui/AlertDialog";

const WORD_OF_THE_DAY_KEY = (dateKey: string) =>
  `WORD_OF_THE_DAY_ID_${dateKey}`;

export const useWordData = (wordId?: string, isRandom: boolean = false) => {
  const setLoading = useSetLoading();
  const isLoading = useIsLoading();
  const setError = useSetError();
  const error = useError();
  const alertDialog = useAlertDialog();
  const [word, setWord] = useState<WordForm | null>(null);
  const [lemma, setLemma] = useState<Lemma | null>(null);

  const handleError = useCallback(
    (error: any, message: string) => {
      console.error(message, error);
      setError(message);
      alertDialog.error(message);
    },
    [setError]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const fetchWordForm = useCallback(
    async (wordId: string) => {
      try {
        setLoading(true);
        clearError();

        const wordForm = await apiClient.getWordForm(wordId);
        const lemmaData = await apiClient.getLemma(wordForm.lemmaId);

        setWord(wordForm);
        setLemma(lemmaData);
        return true;
      } catch (error) {
        handleError(error, "Failed to load word");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, handleError, clearError]
  );

  const fetchRandomWord = useCallback(async () => {
    try {
      setLoading(true);
      clearError();

      const dateKey = getCurrentDateKey();
      const cachedWordId = await retrieveData<string>(
        WORD_OF_THE_DAY_KEY(dateKey)
      );

      if (cachedWordId) {
        return await fetchWordForm(cachedWordId);
      }

      handleError(null, "No word of the day found");
      return false;
    } catch (error) {
      handleError(error, "Failed to load random word");
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, fetchWordForm, handleError, clearError]);

  return {
    // State
    word,
    lemma,
    error,
    isLoading,

    // Actions
    fetchWordForm,
    fetchRandomWord,
    clearError,
  };
};
