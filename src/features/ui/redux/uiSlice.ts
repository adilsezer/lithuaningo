// src/features/ui/uiSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  message: string | null;
  messageType: "error" | "success" | "info" | "warning" | null;
  isLoading: boolean;
}

const initialState: UIState = {
  message: null,
  messageType: null,
  isLoading: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setMessage(
      state,
      action: PayloadAction<{ message: string; type: UIState["messageType"] }>
    ) {
      state.message = action.payload.message;
      state.messageType = action.payload.type;
    },
    clearMessage(state) {
      state.message = null;
      state.messageType = null;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const { setMessage, clearMessage, setLoading } = uiSlice.actions;
export default uiSlice.reducer;
