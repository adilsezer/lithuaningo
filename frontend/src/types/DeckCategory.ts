export const deckCategories = [
  "Beginner",
  "Advanced",
  "Grammar",
  "Vocabulary",
  "Reading",
  "Writing",
  "Speaking",
  "Listening",
  "Arts & Culture",
  "Science & Tech",
  "Other",
] as const;

export type DeckCategory = (typeof deckCategories)[number];

export interface DeckCategoryMetadata {
  id: (typeof deckCategories)[number];
  label: string;
  description?: string;
}
