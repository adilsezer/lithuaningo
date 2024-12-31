import { useState, useEffect } from "react";
import { WordForm, Lemma, Sentence } from "@src/types";
import apiClient from "@services/api/apiClient";
import { useAppDispatch } from "@redux/hooks";
import { setLoading } from "@redux/slices/uiSlice";
import { retrieveData } from "@utils/storageUtils";
import { getCurrentDateKey } from "@utils/dateUtils";

const WORD_OF_THE_DAY_KEY = (dateKey: string) =>
  `WORD_OF_THE_DAY_ID_${dateKey}`;

export const useWordData = (wordId?: string, isRandom: boolean = false) => {
  const [word, setWord] = useState<WordForm | null>(null);
  const [lemma, setLemma] = useState<Lemma | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const dispatch = useAppDispatch();

  const fetchWordForm = async (wordId: string) => {
    try {
      dispatch(setLoading(true));
      const wordForm = await apiClient.getWordForm(wordId);
      const lemmaData = await apiClient.getLemma(wordForm.lemmaId);
      setWord(wordForm);
      setLemma(lemmaData);
    } catch (error) {
      setError(
        error instanceof Error ? error : new Error("Failed to load word")
      );
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchRandomWord = async () => {
    try {
      dispatch(setLoading(true));
      const dateKey = getCurrentDateKey();
      const cachedWordId = await retrieveData<string>(
        WORD_OF_THE_DAY_KEY(dateKey)
      );
      if (cachedWordId) {
        await fetchWordForm(cachedWordId);
      }
    } catch (error) {
      setError(
        error instanceof Error ? error : new Error("Failed to load random word")
      );
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    const loadWord = async () => {
      if (!isRandom && !wordId) return;

      try {
        dispatch(setLoading(true));

        if (isRandom) {
          await fetchRandomWord();
        } else {
          await fetchWordForm(wordId!);
        }
      } catch (error) {
        console.error("Error loading word:", error);
        setError(
          error instanceof Error ? error : new Error("Failed to load word")
        );
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadWord();
  }, [wordId, isRandom, dispatch]);

  return { word, lemma, error, fetchWordForm, fetchRandomWord };
};
