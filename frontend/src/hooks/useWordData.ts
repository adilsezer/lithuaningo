import { useState, useCallback } from "react";
import { WordForm, Lemma } from "@src/types";
import apiClient from "@services/api/apiClient";
import { useAppDispatch } from "@redux/hooks";
import { setLoading } from "@redux/slices/uiSlice";
import { retrieveData } from "@utils/storageUtils";
import { getCurrentDateKey } from "@utils/dateUtils";
import { AlertDialog } from "@components/ui/AlertDialog";

const WORD_OF_THE_DAY_KEY = (dateKey: string) =>
  `WORD_OF_THE_DAY_ID_${dateKey}`;

export const useWordData = (wordId?: string, isRandom: boolean = false) => {
  const dispatch = useAppDispatch();
  const [word, setWord] = useState<WordForm | null>(null);
  const [lemma, setLemma] = useState<Lemma | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = useCallback((error: any, message: string) => {
    console.error(message, error);
    setError(message);
    AlertDialog.error(message);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchWordForm = useCallback(
    async (wordId: string) => {
      try {
        setIsLoading(true);
        dispatch(setLoading(true));
        clearError();

        const wordForm = await apiClient.getWordForm(wordId);
        const lemmaData = await apiClient.getLemma(wordForm.lemmaId);

        setWord(wordForm);
        setLemma(lemmaData);
      } catch (error) {
        handleError(error, "Failed to load word");
        return false;
      } finally {
        setIsLoading(false);
        dispatch(setLoading(false));
      }
      return true;
    },
    [dispatch, handleError, clearError]
  );

  const fetchRandomWord = useCallback(async () => {
    try {
      setIsLoading(true);
      dispatch(setLoading(true));
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
      setIsLoading(false);
      dispatch(setLoading(false));
    }
  }, [dispatch, fetchWordForm, handleError, clearError]);

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
