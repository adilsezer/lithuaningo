import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

interface UIState {
  isLoading: boolean;
  // Add other UI state properties here as needed
}

const initialState: UIState = {
  isLoading: false,
  // Initialize other properties here
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    // Add other reducers for handling different UI states
  },
});

export const { setLoading } = uiSlice.actions; // Export actions

// Selectors
export const selectIsLoading = (state: RootState) => state.ui.isLoading; // Loading state selector

export default uiSlice.reducer;
