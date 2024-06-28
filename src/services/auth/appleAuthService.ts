import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import * as AppleAuthentication from "expo-apple-authentication";
import { logIn, logOut } from "@src/redux/slices/userSlice";
import { AppDispatch } from "@src/redux/store";

export const signInWithApple = async (
  dispatch: AppDispatch
): Promise<FirebaseAuthTypes.UserCredential> => {
  try {
    const appleAuthRequestResponse = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    const { identityToken, authorizationCode } = appleAuthRequestResponse;

    if (identityToken && authorizationCode) {
      const appleCredential = auth.AppleAuthProvider.credential(
        identityToken,
        authorizationCode
      );
      const userCredential = await auth().signInWithCredential(appleCredential);

      dispatch(
        logIn({
          name: userCredential.user.displayName || "No Name",
          email: userCredential.user.email!,
          id: userCredential.user.uid,
          emailVerified: true,
        })
      );
      return userCredential;
    } else {
      throw new Error(
        "Failed to retrieve identity token or authorization code"
      );
    }
  } catch (e: any) {
    if (e.code === "ERR_REQUEST_CANCELED") {
      throw new Error("User cancelled the sign-in flow");
    } else {
      throw e;
    }
  }
};

export const getAppleCredential =
  async (): Promise<FirebaseAuthTypes.AuthCredential> => {
    const appleAuthRequestResponse = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    const { identityToken, authorizationCode } = appleAuthRequestResponse;

    if (!identityToken || !authorizationCode) {
      throw new Error(
        "Failed to retrieve identity token or authorization code"
      );
    }

    return auth.AppleAuthProvider.credential(identityToken, authorizationCode);
  };

export const signOutApple = async (dispatch: AppDispatch): Promise<void> => {
  try {
    await auth().signOut();
    dispatch(logOut());
  } catch (error) {
    console.error("Sign-out failed:", error);
    throw error;
  }
};
