// src/services/FirebaseAuthService.ts
import auth from "@react-native-firebase/auth";
import { AppDispatch } from "../../../store/store"; // Adjust the import path as necessary
import { logIn, logOut } from "../redux/userSlice"; // Adjust the import path as necessary

export const signInWithEmail = async (
  email: string,
  password: string,
  dispatch: AppDispatch // Pass dispatch as an argument
): Promise<void> => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(
      email,
      password
    );
    const user = userCredential.user;
    dispatch(
      logIn({ name: user.displayName || "No Name", email: user.email! })
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  dispatch: AppDispatch // Pass dispatch as an argument
): Promise<void> => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(
      email,
      password
    );
    const user = userCredential.user;
    dispatch(
      logIn({ name: user.displayName || "No Name", email: user.email! })
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const signOutUser = async (dispatch: AppDispatch): Promise<void> => {
  // Pass dispatch as an argument
  try {
    await auth().signOut();
    dispatch(logOut());
  } catch (error) {
    console.error(error);
    throw error;
  }
};
