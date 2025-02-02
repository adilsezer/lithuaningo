import BackButton from "@components/layout/BackButton";
import CustomText from "@components/ui/CustomText";
import { useFlashcards } from "@src/hooks/useFlashcards";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function EditFlashcardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View>
      <BackButton />
      <CustomText>Edit Flashcard</CustomText>
    </View>
  );
}
