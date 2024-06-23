import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ClickedWordsState = string[];

const initialState: ClickedWordsState = [];

const clickedWordsSlice = createSlice({
  name: "clickedWords",
  initialState,
  reducers: {
    setClickedWords: (state, action: PayloadAction<string[]>) => {
      return action.payload;
    },
    addClickedWord: (state, action: PayloadAction<string>) => {
      if (!state.includes(action.payload)) {
        state.push(action.payload);
      }
    },
    resetClickedWords: () => initialState,
  },
});

export const { setClickedWords, addClickedWord, resetClickedWords } =
  clickedWordsSlice.actions;
export default clickedWordsSlice.reducer;
