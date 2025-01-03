import { GoogleSignin } from "@react-native-google-signin/google-signin";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { logIn, logOut } from "@redux/slices/userSlice";
import { AppDispatch } from "@redux/store";
import Constants from "expo-constants";

GoogleSignin.configure({
  webClientId: Constants.expoConfig?.extra?.googleWebClientId,
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

    dispatch(
      logIn({
        name: userCredential.user.displayName || "No Name",
        email: userCredential.user.email!,
        id: userCredential.user.uid,
        emailVerified: true,
      })
    );
    return userCredential;
  } catch (error) {
    console.error("Google Sign-In failed:", error);
    throw error;
  }
};

export const getGoogleCredential =
  async (): Promise<FirebaseAuthTypes.AuthCredential> => {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    return auth.GoogleAuthProvider.credential(userInfo.idToken);
  };

export const signOutGoogle = async (dispatch: AppDispatch): Promise<void> => {
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
