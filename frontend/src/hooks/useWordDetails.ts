import { useEffect } from "react";
import { useWordData } from "@hooks/useWordData";

export const useWordDetails = (wordId: string | undefined) => {
  const { word, lemma, error, isLoading, fetchWordForm, clearError } =
    useWordData(wordId);

  useEffect(() => {
    const loadWord = async () => {
      if (wordId) {
        await fetchWordForm(wordId);
      }
    };

    loadWord();
  }, [wordId, fetchWordForm]);

  return {
    wordData: { word, lemma },
    loading: isLoading,
    error,
    isValidWordId: !!wordId,
    clearError,
  };
};
