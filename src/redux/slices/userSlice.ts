import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  isAdmin: boolean;
}

interface UserState {
  isLoggedIn: boolean;
  data: UserProfile | null;
  needsReauthentication: boolean;
}

const initialState: UserState = {
  isLoggedIn: false,
  data: null,
  needsReauthentication: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logIn: (state, action: PayloadAction<UserProfile>) => {
      state.isLoggedIn = true;
      state.data = action.payload;
      state.needsReauthentication = false;
    },
    logOut: (state) => {
      state.isLoggedIn = false;
      state.data = null;
      state.needsReauthentication = false;
    },
    updateUserProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.isLoggedIn && state.data) {
        state.data = { ...state.data, ...action.payload };
      }
    },
    requireReauthentication: (state) => {
      state.needsReauthentication = true;
    },
    clearReauthenticationRequirement: (state) => {
      state.needsReauthentication = false;
    },
    deleteUserAccount: (state) => {
      state.isLoggedIn = false;
      state.data = null;
      state.needsReauthentication = false;
    },
  },
});

export const {
  logIn,
  logOut,
  updateUserProfile,
  requireReauthentication,
  clearReauthenticationRequirement,
  deleteUserAccount,
} = userSlice.actions;

export const selectIsLoggedIn = (state: RootState): boolean =>
  state.user.isLoggedIn;
export const selectUserData = (state: RootState): UserProfile | null =>
  state.user.data;
export const selectNeedsReauthentication = (state: RootState): boolean =>
  state.user.needsReauthentication;
export const selectIsAuthenticated = (state: RootState): boolean =>
  state.user.isLoggedIn && (state.user.data?.emailVerified || false);

export default userSlice.reducer;

export type { UserProfile };
