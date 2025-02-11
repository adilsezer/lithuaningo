export interface WordForm {
  id: string;
  word: string;
  lemmaId: string;
  attributes: Record<string, string>;
  createdAt: string;
  timeAgo: string;
  updatedAt: string;
}
