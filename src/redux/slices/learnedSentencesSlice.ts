// src/redux/slices/learnedSentencesSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LearnedSentencesState {
  learnedSentenceIds: string[];
}

const initialState: LearnedSentencesState = {
  learnedSentenceIds: [],
};

const learnedSentencesSlice = createSlice({
  name: "learnedSentences",
  initialState,
  reducers: {
    setLearnedSentences(state, action: PayloadAction<string[]>) {
      state.learnedSentenceIds = action.payload;
    },
    clearLearnedSentences(state) {
      state.learnedSentenceIds = [];
    },
  },
});

export const { setLearnedSentences, clearLearnedSentences } =
  learnedSentencesSlice.actions;
export default learnedSentencesSlice.reducer;
