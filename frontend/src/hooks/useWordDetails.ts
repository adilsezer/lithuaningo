import { useEffect, useState } from "react";
import { useAppDispatch } from "@redux/hooks";
import { setLoading } from "@redux/slices/uiSlice";
import { useWordData } from "@hooks/useWordData";

export const useWordDetails = (wordId: string | undefined) => {
  const dispatch = useAppDispatch();
  const { word, lemma, error, fetchWordForm } = useWordData(wordId);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadWord = async () => {
      if (wordId) {
        setIsLoading(true);
        dispatch(setLoading(true));
        await fetchWordForm(wordId);
        setIsLoading(false);
        dispatch(setLoading(false));
      }
    };

    loadWord();
  }, [wordId, dispatch, fetchWordForm]);

  return {
    wordData: { word, lemma },
    loading: isLoading,
    error,
    isValidWordId: !!wordId,
  };
};
