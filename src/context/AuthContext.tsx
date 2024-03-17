import React, { createContext, useContext, ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks"; // Adjust the import path as needed
import { logIn, logOut } from "../features/auth/redux/userSlice"; // Adjust the import path as needed

interface AuthContextType {
  signIn: (credentials: { name: string; email: string }) => void;
  signOut: () => void;
  session: { name: string; email: string } | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useSession(): AuthContextType {
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);
  const userData = useAppSelector((state) => state.user.data);

  const signIn = (credentials: { name: string; email: string }) => {
    dispatch(logIn(credentials));
  };

  const signOut = () => {
    dispatch(logOut());
  };

  return {
    signIn,
    signOut,
    session: isLoggedIn ? userData : null,
    isLoading: false, // Adjust loading logic as needed
  };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider value={useSession()}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a SessionProvider");
  }
  return context;
};
