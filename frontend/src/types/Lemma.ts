export interface Lemma {
  id: string;
  lemmaText: string;
  partOfSpeech: string;
  translation: string;
  definitions: string[];
  ipa: string;
  examples: string[];
  imageUrl: string;
  audioUrl: string;
  notes: string[];
}
