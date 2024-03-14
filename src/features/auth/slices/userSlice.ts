import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../../store/store";

interface UserState {
  isLoggedIn: boolean;
  data: null | { name: string; email: string };
}

const initialState: UserState = {
  isLoggedIn: false,
  data: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logIn: (state, action: PayloadAction<{ name: string; email: string }>) => {
      state.isLoggedIn = true;
      state.data = action.payload;
    },
    logOut: (state) => {
      state.isLoggedIn = false;
      state.data = null;
    },
  },
});

export const { logIn, logOut } = userSlice.actions;

export const selectIsLoggedIn = (state: RootState) => state.user.isLoggedIn;
export const selectUserData = (state: RootState) => state.user.data;

export default userSlice.reducer;
