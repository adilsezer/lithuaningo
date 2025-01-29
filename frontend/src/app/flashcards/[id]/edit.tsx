import CustomText from "@components/ui/CustomText";
import { useFlashcards } from "@src/hooks/useFlashcards";
import { useLocalSearchParams } from "expo-router";

export default function EditFlashcardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <CustomText>Edit Flashcard</CustomText>;
}
