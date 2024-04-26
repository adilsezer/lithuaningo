import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

// Improved TypeScript definitions for clarity and nullability
interface UserProfile {
  name: string | null; // Consider if you really want this nullable.
  email: string;
  photoURL?: string | null; // Make it explicitly optional and nullable.
  emailVerified: boolean;
}

// Defining initial state type based on the interface directly
interface UserState {
  isLoggedIn: boolean;
  data: UserProfile | null;
  needsReauthentication: boolean;
}

// Explicit initial state matching the UserState interface
const initialState: UserState = {
  isLoggedIn: false,
  data: null,
  needsReauthentication: false,
};

export const userSlice = createSlice({
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

// Actions export
export const {
  logIn,
  logOut,
  updateUserProfile,
  requireReauthentication,
  clearReauthenticationRequirement,
  deleteUserAccount,
} = userSlice.actions;

// Selectors for accessing state in a type-safe manner
export const selectIsLoggedIn = (state: RootState): boolean =>
  state.user.isLoggedIn;
export const selectUserData = (state: RootState): UserState["data"] =>
  state.user.data;
export const selectNeedsReauthentication = (state: RootState): boolean =>
  state.user.needsReauthentication;

export const selectIsAuthenticated = (state: RootState): boolean =>
  state.user.isLoggedIn && (state.user.data?.emailVerified || false);

export default userSlice.reducer;

export type { UserProfile }; // Make sure to export the UserProfile type
