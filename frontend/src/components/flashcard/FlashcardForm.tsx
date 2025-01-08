import React from "react";
import { View, StyleSheet } from "react-native";
import { Flashcard } from "@src/types";
import { Form } from "@components/form/Form";
import { FormField } from "@components/form/form.types";
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
  const fields: FormField[] = [
    {
      name: "front",
      label: "Front Side",
      category: "text-input",
      type: "text",
      placeholder: "Enter front side text",
      validation: {
        required: true,
        message: "Front side is required",
      },
      defaultValue: initialValues?.front,
    },
    {
      name: "back",
      label: "Back Side",
      category: "text-input",
      type: "text",
      placeholder: "Enter back side text",
      validation: {
        required: true,
        message: "Back side is required",
      },
      defaultValue: initialValues?.back,
    },
    {
      name: "exampleSentence",
      label: "Example Sentence",
      category: "text-input",
      type: "text",
      placeholder: "Enter an example sentence (optional)",
      defaultValue: initialValues?.exampleSentence,
    },
  ];

  const handleSubmit = async (data: Partial<Flashcard>) => {
    onSubmit({
      front: data.front || "",
      back: data.back || "",
      exampleSentence: data.exampleSentence,
      deckId: initialValues?.deckId || "",
      createdBy: initialValues?.createdBy || "",
    });
  };

  return (
    <View style={styles.container}>
      <SectionTitle>
        {initialValues ? "Edit Flashcard" : "Add Flashcard"}
      </SectionTitle>
      <Form
        fields={fields}
        onSubmit={handleSubmit}
        submitButtonText={initialValues ? "Save" : "Add"}
        defaultValues={initialValues}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
