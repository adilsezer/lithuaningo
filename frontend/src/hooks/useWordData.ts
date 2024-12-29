import { useState, useEffect } from "react";
import { WordForm, Lemma } from "@src/types";
import apiClient from "@services/api/apiClient";
import { useAppDispatch } from "@redux/hooks";
import { setLoading } from "@redux/slices/uiSlice";

export const useWordData = (wordId: string) => {
  const [word, setWord] = useState<WordForm | null>(null);
  const [lemma, setLemma] = useState<Lemma | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const loadWord = async () => {
      try {
        dispatch(setLoading(true));
        const wordForm = await apiClient.getWordForm(wordId);
        setWord(wordForm);
        const lemmaData = await apiClient.getLemma(wordForm.lemmaId);
        setLemma(lemmaData);
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
  }, [wordId, dispatch]);

  return { word, lemma, error };
};
