import { GoogleSignin } from "@react-native-google-signin/google-signin";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { AppDispatch } from "../redux/store";
import { logIn, logOut } from "../redux/slices/userSlice";
import { FirebaseDataService } from "./FirebaseDataService";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  offlineAccess: true,
});

export const signInWithGoogle = async (
  dispatch: AppDispatch
): Promise<FirebaseAuthTypes.UserCredential> => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    const googleCredential = auth.GoogleAuthProvider.credential(
      userInfo.idToken
    );
    const userCredential = await auth().signInWithCredential(googleCredential);
    const adminStatus = await FirebaseDataService.isAdmin(
      userCredential.user.uid
    ); // Use the helper function

    dispatch(
      logIn({
        name: userCredential.user.displayName || "No Name",
        email: userCredential.user.email!,
        id: userCredential.user.uid,
        emailVerified: true,
        isAdmin: adminStatus,
      })
    );
    return userCredential;
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
  } catch (error) {
    console.error("Sign-out failed:", error);
    throw error;
  }
};
