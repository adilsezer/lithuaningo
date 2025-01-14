export const deckCategories = [
  "All",
  "My",
  "Top",
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

export const deckCategoryMetadata: Record<DeckCategory, DeckCategoryMetadata> =
  {
    All: {
      id: "All",
      label: "All Decks",
      description: "View all available decks",
    },
    My: {
      id: "My",
      label: "My Decks",
      description: "View your created decks",
    },
    Top: {
      id: "Top",
      label: "Top Rated",
      description: "View top rated decks",
    },
    Beginner: {
      id: "Beginner",
      label: "Beginner",
      description: "Basic Lithuanian language concepts",
    },
    Advanced: {
      id: "Advanced",
      label: "Advanced",
      description: "Complex Lithuanian language topics",
    },
    Grammar: {
      id: "Grammar",
      label: "Grammar",
      description: "Lithuanian grammar rules and patterns",
    },
    Vocabulary: {
      id: "Vocabulary",
      label: "Vocabulary",
      description: "Essential Lithuanian vocabulary",
    },
    Reading: {
      id: "Reading",
      label: "Reading",
      description: "Lithuanian reading comprehension",
    },
    Writing: {
      id: "Writing",
      label: "Writing",
      description: "Lithuanian writing practice",
    },
    Speaking: {
      id: "Speaking",
      label: "Speaking",
      description: "Lithuanian speaking exercises",
    },
    Listening: {
      id: "Listening",
      label: "Listening",
      description: "Lithuanian listening comprehension",
    },
    "Arts & Culture": {
      id: "Arts & Culture",
      label: "Arts & Culture",
      description: "Lithuanian arts and cultural topics",
    },
    "Science & Tech": {
      id: "Science & Tech",
      label: "Science & Tech",
      description: "Scientific and technical Lithuanian vocabulary",
    },
    Other: {
      id: "Other",
      label: "Other",
      description: "Miscellaneous Lithuanian topics",
    },
  };

export interface DeckCategoryMetadata {
  id: DeckCategory;
  label: string;
  description: string;
}
