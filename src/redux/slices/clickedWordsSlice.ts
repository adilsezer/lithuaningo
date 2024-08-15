import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ClickedWordsState = string[];

const initialState: ClickedWordsState = [];

const clickedWordsSlice = createSlice({
  name: "clickedWords",
  initialState,
  reducers: {
    addClickedWord: (state, action: PayloadAction<string>) => {
      if (!state.includes(action.payload)) {
        state.push(action.payload);
      }
    },
    removeClickedWord: (state, action: PayloadAction<string>) => {
      return state.filter((word) => word !== action.payload);
    },
    resetClickedWords: () => initialState,
  },
});

export const { addClickedWord, removeClickedWord, resetClickedWords } =
  clickedWordsSlice.actions;
export default clickedWordsSlice.reducer;
