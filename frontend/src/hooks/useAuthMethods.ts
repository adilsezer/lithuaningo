import { useAppDispatch } from "@redux/hooks";
import { getErrorMessage } from "@utils/errorMessages";
import { useRouter } from "expo-router";
import crashlytics from "@react-native-firebase/crashlytics";
import {
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
  sendPasswordResetEmail,
  updateAuthUserProfile,
  sendEmailVerification,
  updateUserPassword,
  deleteUser,
  reauthenticateUser,
} from "@services/auth/firebaseAuthService";
import {
  signInWithGoogle,
  getGoogleCredential,
} from "@services/auth/googleAuthService";
import {
  signInWithApple,
  getAppleCredential,
} from "@services/auth/appleAuthService";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import apiClient from "@services/api/apiClient";

const useAuthMethods = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const ensureUserProfile = async (user: FirebaseAuthTypes.User) => {
    const userProfile = await apiClient.getUserProfile(user.uid);

    if (!userProfile) {
      await apiClient.createUserProfile(user.uid);
      const newUserProfile = await apiClient.getUserProfile(user.uid);
      newUserProfile.name = user.displayName || "No Name";
      newUserProfile.email = user.email || "";
      await apiClient.updateUserProfile(newUserProfile);
    }

    return userProfile;
  };

  const handleSignUpWithEmail = async (
    email: string,
    password: string,
    name: string
  ) => {
    try {
      const { user } = await signUpWithEmail(email, password, dispatch);
      await user.updateProfile({ displayName: name });
      await sendEmailVerification();

      crashlytics().setUserId(user.uid);

      router.replace("/auth/login");
      return {
        success: true,
        message:
          "Registration successful! Please verify your email to continue.",
      };
    } catch (error: any) {
      crashlytics().recordError(error);
      return {
        success: false,
        message: error.code ? getErrorMessage(error.code) : error.message,
      };
    }
  };

  const handleLoginWithEmail = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmail(email, password, dispatch);
      const user = userCredential.user;

      if (!user) throw new Error("User does not exist.");

      await ensureUserProfile(user);

      crashlytics().setUserId(user.uid);
      router.replace("/dashboard");
      return { success: true };
    } catch (error: any) {
      crashlytics().recordError(error);
      return {
        success: false,
        message: error.code ? getErrorMessage(error.code) : error.message,
      };
    }
  };

  const handleLoginWithGoogle = async () => {
    try {
      const userCredential = await signInWithGoogle(dispatch);
      const user = userCredential.user;

      await ensureUserProfile(user);

      crashlytics().setUserId(user.uid);
      router.replace("/dashboard");
      return { success: true };
    } catch (error: any) {
      crashlytics().recordError(error);
      return {
        success: false,
        message: error.code ? getErrorMessage(error.code) : error.message,
      };
    }
  };

  const handleLoginWithApple = async () => {
    try {
      const userCredential = await signInWithApple(dispatch);
      const user = userCredential.user;

      await ensureUserProfile(user);

      crashlytics().setUserId(user.uid);
      router.replace("/dashboard");
      return { success: true };
    } catch (error: any) {
      crashlytics().recordError(error);
      return {
        success: false,
        message: error.code ? getErrorMessage(error.code) : error.message,
      };
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser(dispatch);
      crashlytics().log("User signed out.");
      router.replace("/");
      return { success: true };
    } catch (error: any) {
      crashlytics().recordError(error);
      return {
        success: false,
        message: error.code ? getErrorMessage(error.code) : error.message,
      };
    }
  };

  const handlePasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(email);
      router.replace("/auth/login");
      return {
        success: true,
        message: "Password reset email sent. Please check your inbox.",
      };
    } catch (error: any) {
      crashlytics().recordError(error);
      return {
        success: false,
        message: error.code ? getErrorMessage(error.code) : error.message,
      };
    }
  };

  const handleUpdateUserProfile = async (
    currentPassword: string,
    updates: { displayName?: string }
  ) => {
    try {
      const user = auth().currentUser;
      if (!user) {
        throw new Error("No user is currently signed in.");
      }

      let credential: FirebaseAuthTypes.AuthCredential | undefined;

      if (
        user.providerData.some((provider) => provider.providerId === "password")
      ) {
        if (!currentPassword) {
          throw new Error("Password is required for reauthentication.");
        }
        credential = auth.EmailAuthProvider.credential(
          user.email!,
          currentPassword
        );
      } else if (
        user.providerData.some(
          (provider) => provider.providerId === "google.com"
        )
      ) {
        credential = await getGoogleCredential();
      } else if (
        user.providerData.some(
          (provider) => provider.providerId === "apple.com"
        )
      ) {
        credential = await getAppleCredential();
      } else {
        throw new Error("Unsupported authentication provider.");
      }

      if (!credential) {
        throw new Error("Failed to retrieve credential for reauthentication.");
      }

      await reauthenticateUser(credential, dispatch);
      await updateAuthUserProfile(updates, dispatch);

      const userProfile = await apiClient.getUserProfile(user.uid);
      if (!userProfile) throw new Error("User profile does not exist.");
      if (updates.displayName) {
        userProfile.name = updates.displayName;
        await apiClient.updateUserProfile(userProfile);
      }

      crashlytics().setUserId(user.uid);
      router.replace("/dashboard/profile");
      return {
        success: true,
        message: "Profile updated successfully.",
      };
    } catch (error: any) {
      crashlytics().recordError(error);
      return {
        success: false,
        message: error.code ? getErrorMessage(error.code) : error.message,
      };
    }
  };

  const handleUpdateUserPassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    try {
      const user = auth().currentUser;
      if (!user) {
        throw new Error("No user is currently signed in.");
      }

      const credential = auth.EmailAuthProvider.credential(
        user.email!,
        currentPassword
      );
      await reauthenticateUser(credential, dispatch);
      await updateUserPassword(newPassword, dispatch);

      crashlytics().setUserId(user.uid);
      router.replace("/dashboard/profile");
      return {
        success: true,
        message: "Password updated successfully.",
      };
    } catch (error: any) {
      crashlytics().recordError(error);
      return {
        success: false,
        message: error.code ? getErrorMessage(error.code) : error.message,
      };
    }
  };

  const handleDeleteUserAccount = async (password?: string) => {
    try {
      const user = auth().currentUser;
      if (!user) {
        throw new Error("No user is currently signed in.");
      }

      let credential: FirebaseAuthTypes.AuthCredential | undefined;

      if (
        user.providerData.some((provider) => provider.providerId === "password")
      ) {
        if (!password) {
          throw new Error("Password is required for reauthentication.");
        }
        credential = auth.EmailAuthProvider.credential(user.email!, password);
      } else if (
        user.providerData.some(
          (provider) => provider.providerId === "google.com"
        )
      ) {
        credential = await getGoogleCredential();
      } else if (
        user.providerData.some(
          (provider) => provider.providerId === "apple.com"
        )
      ) {
        credential = await getAppleCredential();
      } else {
        throw new Error("Unsupported authentication provider.");
      }

      if (!credential) {
        throw new Error("Failed to retrieve credential for reauthentication.");
      }

      await reauthenticateUser(credential, dispatch);
      await apiClient.deleteUserProfile(user.uid);
      await deleteUser(dispatch);

      crashlytics().setUserId(user.uid);
      router.replace("/");
      return {
        success: true,
        message: "Account deleted successfully.",
      };
    } catch (error: any) {
      crashlytics().recordError(error);
      return {
        success: false,
        message: error.code ? getErrorMessage(error.code) : error.message,
      };
    }
  };

  const handleReauthenticateUser = async (
    credential: FirebaseAuthTypes.AuthCredential
  ) => {
    try {
      await reauthenticateUser(credential, dispatch);
      return {
        success: true,
        message: "User re-authenticated successfully.",
      };
    } catch (error: any) {
      crashlytics().recordError(error);
      return {
        success: false,
        message: error.code ? getErrorMessage(error.code) : error.message,
      };
    }
  };

  return {
    handleSignUpWithEmail,
    handleLoginWithEmail,
    handleLoginWithGoogle,
    handleLoginWithApple,
    handleSignOut,
    handlePasswordReset,
    handleUpdateUserProfile,
    handleUpdateUserPassword,
    handleDeleteUserAccount,
    handleReauthenticateUser,
  };
};

export default useAuthMethods;
