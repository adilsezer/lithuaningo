import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@redux/store";

interface UIState {
  isLoading: boolean;
}

const initialState: UIState = {
  isLoading: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setLoading } = uiSlice.actions;

export const selectIsLoading = (state: RootState) => state.ui.isLoading;

export default uiSlice.reducer;
