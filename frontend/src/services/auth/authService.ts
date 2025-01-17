import { GoogleSignin } from "@react-native-google-signin/google-signin";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { AppDispatch } from "@redux/store";
import {
  logIn,
  logOut,
  requireReauthentication,
  clearReauthenticationRequirement,
  deleteUserAccount,
} from "@redux/slices/userSlice";
import * as AppleAuthentication from "expo-apple-authentication";
import apiClient from "@services/api/apiClient";
import crashlytics from "@react-native-firebase/crashlytics";
import Constants from "expo-constants";
import { getErrorMessage } from "@utils/errorMessages";

GoogleSignin.configure({
  webClientId: Constants.expoConfig?.extra?.googleWebClientId,
  offlineAccess: true,
});

interface AuthResponse {
  success: boolean;
  message?: string;
}

interface ProfileUpdateData {
  displayName?: string;
  email?: string;
}

// State
let lastEmailVerificationTime = 0;
const verificationCooldown = 300000; // 5 minutes

// Helper Functions
const handleAuthError = (error: any): AuthResponse => {
  console.error("Auth operation failed:", error.message);
  crashlytics().recordError(error);
  return {
    success: false,
    message: error.code ? getErrorMessage(error.code) : error.message,
  };
};

const updateEmailVerificationStatus = async (user: FirebaseAuthTypes.User) => {
  try {
    const userProfile = await apiClient.getUserProfile(user.uid);
    if (userProfile && userProfile.emailVerified !== user.emailVerified) {
      await apiClient.updateUserProfile({
        ...userProfile,
        emailVerified: user.emailVerified,
      });
    }
  } catch (error) {
    console.error("Error updating email verification status:", error);
    if (error instanceof Error) {
      crashlytics().recordError(error);
    } else {
      crashlytics().recordError(new Error(String(error)));
    }
  }
};

export const updateUserState = async (
  user: FirebaseAuthTypes.User,
  dispatch: AppDispatch
) => {
  if (!user.email) {
    throw new Error("User email is unexpectedly null or undefined.");
  }

  dispatch(
    logIn({
      id: user.uid,
      name: user.displayName || "No Name",
      email: user.email,
      emailVerified: user.emailVerified,
    })
  );

  // Update email verification status in Firestore
  await updateEmailVerificationStatus(user);
};

const ensureUserProfile = async (user: FirebaseAuthTypes.User) => {
  const userProfile = await apiClient.getUserProfile(user.uid);
  if (!userProfile) {
    await apiClient.createUserProfile(user.uid);
    const newUserProfile = await apiClient.getUserProfile(user.uid);
    newUserProfile.name = user.displayName || "No Name";
    newUserProfile.email = user.email || "";
    newUserProfile.emailVerified = user.emailVerified;
    await apiClient.updateUserProfile(newUserProfile);
  }
};

const getGoogleCredential =
  async (): Promise<FirebaseAuthTypes.AuthCredential> => {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    return auth.GoogleAuthProvider.credential(userInfo.idToken);
  };

const getAppleCredential =
  async (): Promise<FirebaseAuthTypes.AuthCredential> => {
    const appleAuthResponse = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    return auth.AppleAuthProvider.credential(
      appleAuthResponse.identityToken!,
      appleAuthResponse.authorizationCode!
    );
  };

// Auth Functions
export const signUpWithEmail = async (
  email: string,
  password: string,
  name: string,
  dispatch: AppDispatch
): Promise<AuthResponse> => {
  try {
    const { user } = await auth().createUserWithEmailAndPassword(
      email,
      password
    );
    await user.updateProfile({ displayName: name });
    await sendEmailVerification(dispatch);
    await ensureUserProfile(user);
    crashlytics().setUserId(user.uid);
    return {
      success: true,
      message: "Registration successful! Please verify your email to continue.",
    };
  } catch (error) {
    return handleAuthError(error);
  }
};

export const signInWithEmail = async (
  email: string,
  password: string,
  dispatch: AppDispatch
): Promise<AuthResponse> => {
  try {
    const { user } = await auth().signInWithEmailAndPassword(email, password);
    if (!user.emailVerified) {
      // Sign out immediately if email is not verified
      await auth().signOut();
      await sendEmailVerification(dispatch);
      return {
        success: false,
        message:
          "Please verify your email before logging in. A new verification email has been sent.",
      };
    }
    await ensureUserProfile(user);
    await updateUserState(user, dispatch);
    crashlytics().setUserId(user.uid);
    return { success: true };
  } catch (error) {
    return handleAuthError(error);
  }
};

export const signInWithSocialProvider = async (
  provider: "google" | "apple",
  dispatch: AppDispatch
): Promise<AuthResponse> => {
  try {
    const credential = await (provider === "google"
      ? getGoogleCredential()
      : getAppleCredential());

    const userCredential = await auth().signInWithCredential(credential);
    await ensureUserProfile(userCredential.user);
    await updateUserState(userCredential.user, dispatch);
    crashlytics().setUserId(userCredential.user.uid);
    return { success: true };
  } catch (error) {
    return handleAuthError(error);
  }
};

export const signOut = async (dispatch: AppDispatch): Promise<AuthResponse> => {
  try {
    const user = auth().currentUser;
    if (
      user?.providerData.some(
        (provider) => provider.providerId === "google.com"
      )
    ) {
      try {
        const isSignedIn = await GoogleSignin.isSignedIn();
        if (isSignedIn) {
          await GoogleSignin.revokeAccess();
          await GoogleSignin.signOut();
        }
      } catch (googleError) {
        console.error("Google sign out error:", googleError);
        // Continue with Firebase sign out even if Google sign out fails
      }
    }
    await auth().signOut();
    dispatch(logOut());
    return { success: true };
  } catch (error) {
    return handleAuthError(error);
  }
};

export const updateProfile = async (
  currentPassword: string,
  updates: ProfileUpdateData,
  dispatch: AppDispatch
): Promise<AuthResponse> => {
  try {
    const user = auth().currentUser;
    if (!user) throw new Error("No user is currently signed in.");

    let credential: FirebaseAuthTypes.AuthCredential | undefined;

    if (
      user.providerData.some((provider) => provider.providerId === "password")
    ) {
      if (!currentPassword)
        throw new Error("Password is required for reauthentication.");
      credential = auth.EmailAuthProvider.credential(
        user.email!,
        currentPassword
      );
    } else if (
      user.providerData.some((provider) => provider.providerId === "google.com")
    ) {
      credential = await getGoogleCredential();
    } else if (
      user.providerData.some((provider) => provider.providerId === "apple.com")
    ) {
      credential = await getAppleCredential();
    }

    if (credential) {
      await reauthenticateUser(credential, dispatch);
    }

    await user.updateProfile(updates);
    if (updates.email) {
      await user.updateEmail(updates.email);
      await sendEmailVerification(dispatch);
    }

    await updateUserState(user, dispatch);
    return {
      success: true,
      message: updates.email
        ? "Profile updated. Please verify your new email address."
        : "Profile updated successfully.",
    };
  } catch (error) {
    return handleAuthError(error);
  }
};

export const updatePassword = async (
  currentPassword: string,
  newPassword: string,
  dispatch: AppDispatch
): Promise<AuthResponse> => {
  try {
    const user = auth().currentUser;
    if (!user) throw new Error("No user is currently signed in.");

    try {
      const credential = auth.EmailAuthProvider.credential(
        user.email!,
        currentPassword
      );
      await reauthenticateUser(credential, dispatch);
      await user.updatePassword(newPassword);
    } catch (error: any) {
      if (error.code === "auth/requires-recent-login") {
        dispatch(requireReauthentication());
      }
      throw error;
    }

    return { success: true, message: "Password updated successfully." };
  } catch (error) {
    return handleAuthError(error);
  }
};

export const resetPassword = async (email: string): Promise<AuthResponse> => {
  try {
    await auth().sendPasswordResetEmail(email);
    return {
      success: true,
      message: "Password reset email sent. Please check your inbox.",
    };
  } catch (error) {
    return handleAuthError(error);
  }
};

export const deleteAccount = async (
  currentPassword: string | undefined,
  dispatch: AppDispatch
): Promise<AuthResponse> => {
  try {
    const user = auth().currentUser;
    if (!user) throw new Error("No user is currently signed in.");

    if (currentPassword) {
      const credential = auth.EmailAuthProvider.credential(
        user.email!,
        currentPassword
      );
      await reauthenticateUser(credential, dispatch);
    }

    await user.delete();
    dispatch(deleteUserAccount());
    dispatch(logOut());
    return { success: true, message: "Account deleted successfully." };
  } catch (error) {
    return handleAuthError(error);
  }
};

export const sendEmailVerification = async (
  dispatch: AppDispatch
): Promise<AuthResponse> => {
  try {
    const user = auth().currentUser;
    if (!user) throw new Error("No user is currently signed in.");

    const currentTime = Date.now();
    if (currentTime - lastEmailVerificationTime < verificationCooldown) {
      throw new Error(
        "Please wait before requesting another verification email."
      );
    }

    await user.sendEmailVerification();
    lastEmailVerificationTime = currentTime;
    return { success: true, message: "Verification email sent." };
  } catch (error) {
    return handleAuthError(error);
  }
};

export const reauthenticateUser = async (
  credential: FirebaseAuthTypes.AuthCredential,
  dispatch: AppDispatch
): Promise<AuthResponse> => {
  try {
    const user = auth().currentUser;
    if (!user) throw new Error("No user is currently signed in.");

    await user.reauthenticateWithCredential(credential);
    dispatch(clearReauthenticationRequirement());
    return { success: true, message: "Reauthentication successful" };
  } catch (error) {
    return handleAuthError(error);
  }
};
