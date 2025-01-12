import { useAppDispatch } from "@redux/hooks";
import { resetClickedWords } from "@redux/slices/clickedWordsSlice";
import { router } from "expo-router";

export const useChallenge = () => {
  const dispatch = useAppDispatch();

  const handleNavigation = (route: string) => {
    dispatch(resetClickedWords());
    router.push(route);
  };

  return {
    handleNavigation,
  };
};
