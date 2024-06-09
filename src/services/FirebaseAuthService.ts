import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { AppDispatch } from "../redux/store";
import {
  logIn,
  logOut,
  requireReauthentication,
  clearReauthenticationRequirement,
  deleteUserAccount,
  updateUserProfile as updateUserProfileAction,
} from "../redux/slices/userSlice";
import { FirebaseDataService } from "./FirebaseDataService";

type FirebaseError = {
  code: string;
  message: string;
};

const updateUserState = async (
  user: FirebaseAuthTypes.User,
  dispatch: AppDispatch
) => {
  if (!user.email) {
    console.error("User email is unexpectedly null or undefined.");
    throw new Error("User email is unexpectedly null or undefined.");
  }

  if (user.emailVerified) {
    const adminStatus = await FirebaseDataService.isAdmin(user.uid); // Use the helper function
    dispatch(
      logIn({
        id: user.uid,
        name: user.displayName || null,
        email: user.email,
        emailVerified: user.emailVerified,
        isAdmin: adminStatus, // Use the boolean value from the helper function
      })
    );
  }
};

export const signInWithEmail = async (
  email: string,
  password: string,
  dispatch: AppDispatch
): Promise<FirebaseAuthTypes.UserCredential> => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(
      email,
      password
    );

    if (!userCredential.user.emailVerified) {
      await sendEmailVerification();
      throw new Error("Please verify your email before logging in.");
    }
    await updateUserState(userCredential.user, dispatch);
    return userCredential;
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
): Promise<FirebaseAuthTypes.UserCredential> => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(
      email,
      password
    );
    await updateUserState(userCredential.user, dispatch);
    return userCredential;
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
    await updateUserState(user, dispatch);
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
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error("Send password reset email failed:", firebaseError.message);
    throw firebaseError;
  }
};

let lastEmailVerificationTime = 0;

export const sendEmailVerification = async (): Promise<void> => {
  try {
    const user = auth().currentUser;
    if (!user) throw new Error("No user is currently signed in.");

    const currentTime = Date.now();
    const timeSinceLastVerification = currentTime - lastEmailVerificationTime;
    const verificationCooldown = 300000; // 5 minute cooldown

    if (timeSinceLastVerification < verificationCooldown) {
      throw new Error(
        "Email not verified. Verification email sent recently. Please verify or wait a while before requesting again."
      );
    }

    await user.sendEmailVerification();
    lastEmailVerificationTime = currentTime;
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
