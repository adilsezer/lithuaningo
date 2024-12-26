export interface Lemma {
  id: string;
  lemma_text: string;
  partOfSpeech: string;
  translation: string;
  definitions: string[];
  ipa: string;
  examples: string[];
  imageUrl: string;
  audioUrl: string;
  notes: string[];
}
