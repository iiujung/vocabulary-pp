export interface VocabularyWord {
  id: string;
  word: string;
  definition: string;
  addedAt: number;
}

export interface CrosswordWord {
  answer: string;
  clue: string;
  row: number;
  col: number;
  orientation: 'across' | 'down';
}

export interface CrosswordData {
  words: CrosswordWord[];
  theme: string;
}

export interface GridCell {
  row: number;
  col: number;
  value: string;
  isBlack: boolean;
  num?: number;
  active?: boolean;
  correct?: boolean;
  partOfWord?: boolean; // Part of the currently selected word
}

export enum AppTab {
  HOME = 'HOME',
  VOCAB = 'VOCAB',
  DISCOVER = 'DISCOVER'
}
