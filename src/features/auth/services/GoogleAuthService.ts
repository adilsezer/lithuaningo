// services/GoogleAuthService.ts

import { GoogleSignin } from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";
import { AppDispatch } from "../../../store/store"; // Adjust the import path as necessary
import { logIn, logOut } from "../redux/userSlice"; // Adjust the import path as necessary

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  offlineAccess: true, // If you want to access Google API on behalf of the user from your server
});

export const signInWithGoogle = async (
  dispatch: AppDispatch
): Promise<void> => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    const googleCredential = auth.GoogleAuthProvider.credential(
      userInfo.idToken
    );
    const userCredential = await auth().signInWithCredential(googleCredential);

    dispatch(
      logIn({
        name: userCredential.user.displayName || "No Name",
        email: userCredential.user.email!,
      })
    );
    console.log("Google Sign-In successful");
  } catch (error) {
    console.error("Google Sign-In failed:", error);
    throw error;
  }
};

export const signOut = async (dispatch: AppDispatch): Promise<void> => {
  try {
    await GoogleSignin.revokeAccess();
    await GoogleSignin.signOut();
    await auth().signOut();
    dispatch(logOut());
    console.log("Sign-out successful");
  } catch (error) {
    console.error("Sign-out failed:", error);
    throw error;
  }
};
