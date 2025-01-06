import React, { useState } from "react";
import { View, StyleSheet, TextInput } from "react-native";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { Flashcard } from "@src/types";
import CustomButton from "@components/ui/CustomButton";
import { SectionTitle } from "@components/typography";

interface FlashcardFormProps {
  initialValues?: Partial<Flashcard>;
  onSubmit: (flashcard: Omit<Flashcard, "id" | "createdAt">) => void;
  onCancel: () => void;
}

export const FlashcardForm: React.FC<FlashcardFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
}) => {
  const { colors } = useThemeStyles();
  const [front, setFront] = useState(initialValues?.front || "");
  const [back, setBack] = useState(initialValues?.back || "");
  const [exampleSentence, setExampleSentence] = useState(
    initialValues?.exampleSentence || ""
  );

  const handleSubmit = () => {
    if (!front.trim() || !back.trim()) {
      return;
    }

    onSubmit({
      front: front.trim(),
      back: back.trim(),
      exampleSentence: exampleSentence.trim() || undefined,
      deckId: initialValues?.deckId || "",
      createdBy: initialValues?.createdBy || "",
    });
  };

  return (
    <View style={styles.container}>
      <SectionTitle>
        {initialValues ? "Edit Flashcard" : "Add Flashcard"}
      </SectionTitle>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: colors.card, color: colors.text },
        ]}
        placeholder="Front side"
        placeholderTextColor={colors.cardText}
        value={front}
        onChangeText={setFront}
        multiline
      />
      <TextInput
        style={[
          styles.input,
          { backgroundColor: colors.card, color: colors.text },
        ]}
        placeholder="Back side"
        placeholderTextColor={colors.cardText}
        value={back}
        onChangeText={setBack}
        multiline
      />
      <TextInput
        style={[
          styles.input,
          { backgroundColor: colors.card, color: colors.text },
        ]}
        placeholder="Example sentence (optional)"
        placeholderTextColor={colors.cardText}
        value={exampleSentence}
        onChangeText={setExampleSentence}
        multiline
      />
      <View style={styles.buttonContainer}>
        <CustomButton
          title="Cancel"
          onPress={onCancel}
          style={[styles.button, { backgroundColor: colors.error }]}
        />
        <CustomButton
          title={initialValues ? "Save" : "Add"}
          onPress={handleSubmit}
          style={styles.button}
          disabled={!front.trim() || !back.trim()}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  button: {
    flex: 1,
  },
});
