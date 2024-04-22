import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { AppDispatch } from "../../../store/store";
import {
  logIn,
  logOut,
  requireReauthentication,
  clearReauthenticationRequirement,
  deleteUserAccount,
} from "../redux/userSlice";

// Type definition for Firebase errors
type FirebaseError = {
  code: string;
  message: string;
};

const updateUserState = (
  user: FirebaseAuthTypes.User,
  dispatch: AppDispatch
) => {
  if (!user.email) {
    console.error("User email is unexpectedly null or undefined.");
    throw new Error("User email is unexpectedly null or undefined.");
  }

  dispatch(
    logIn({
      name: user.displayName || null, // Fallback to null if not provided
      email: user.email, // Now assured to be non-null
      photoURL: user.photoURL || null, // Fallback to null if not provided
      emailVerified: user.emailVerified,
    })
  );
};

export const signInWithEmail = async (
  email: string,
  password: string,
  dispatch: AppDispatch
): Promise<void> => {
  try {
    const { user } = await auth().signInWithEmailAndPassword(email, password);
    if (!user.emailVerified) {
      throw new Error("Please verify your email before logging in."); // Throw an error if email not verified
    }
    updateUserState(user, dispatch);
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error("SignIn with email failed:", firebaseError.message);
    throw firebaseError;
  }
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  dispatch: AppDispatch
): Promise<void> => {
  try {
    const { user } = await auth().createUserWithEmailAndPassword(
      email,
      password
    );
    updateUserState(user, dispatch);
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error("SignUp with email failed:", firebaseError.message);
    throw firebaseError;
  }
};

export const signOutUser = async (dispatch: AppDispatch): Promise<void> => {
  try {
    await auth().signOut();
    dispatch(logOut());
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error("SignOut failed:", firebaseError.message);
    throw firebaseError;
  }
};

export const updateUserProfile = async (
  updates: FirebaseAuthTypes.UpdateProfile,
  dispatch: AppDispatch
): Promise<void> => {
  try {
    const user = auth().currentUser;
    if (!user) throw new Error("No user is currently signed in.");
    await user.updateProfile(updates);
    updateUserState(user, dispatch);
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error("Update profile failed:", firebaseError.message);
    throw firebaseError;
  }
};

export const updateUserPassword = async (
  newPassword: string,
  dispatch: AppDispatch
): Promise<void> => {
  try {
    const user = auth().currentUser;
    if (!user) throw new Error("No user is currently signed in.");
    await user.updatePassword(newPassword);
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error("Update password failed:", firebaseError.message);
    if (firebaseError.code === "auth/requires-recent-login") {
      dispatch(requireReauthentication());
    }
    throw firebaseError;
  }
};

export const sendPasswordResetEmail = async (email: string): Promise<void> => {
  try {
    await auth().sendPasswordResetEmail(email);
    console.log("Password reset email sent successfully.");
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error("Send password reset email failed:", firebaseError.message);
    throw firebaseError;
  }
};

export const sendEmailVerification = async (): Promise<void> => {
  try {
    const user = auth().currentUser;
    if (!user) throw new Error("No user is currently signed in.");
    await user.sendEmailVerification();
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error("Send email verification failed:", firebaseError.message);
    throw firebaseError;
  }
};

export const deleteUser = async (dispatch: AppDispatch): Promise<void> => {
  try {
    const user = auth().currentUser;
    if (!user) throw new Error("No user is currently signed in.");
    await user.delete();
    dispatch(deleteUserAccount());
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error("Delete user failed:", firebaseError.message);
    throw firebaseError;
  }
};

export const reauthenticateUser = async (
  credential: FirebaseAuthTypes.AuthCredential,
  dispatch: AppDispatch
): Promise<void> => {
  try {
    const user = auth().currentUser;
    if (!user) throw new Error("No user is currently signed in.");
    await user.reauthenticateWithCredential(credential);
    dispatch(clearReauthenticationRequirement());
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error("Reauthenticate user failed:", firebaseError.message);
    throw firebaseError;
  }
};
