import { useAppDispatch } from "@redux/hooks";
import { useRouter } from "expo-router";
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithSocialProvider,
  signOut,
  updateProfile,
  updatePassword,
  resetPassword,
  deleteAccount,
  reauthenticateUser,
} from "@services/auth/authService";
import { useAuthOperation } from "./useAuthOperation";
import { Alert } from "react-native";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import crashlytics from "@react-native-firebase/crashlytics";
import auth from "@react-native-firebase/auth";
import apiClient from "@src/services/api/apiClient";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { performAuthOperation } = useAuthOperation();

  const signUp = async (email: string, password: string, name: string) => {
    const result = await performAuthOperation(async () => {
      const response = await signUpWithEmail(email, password, name, dispatch);
      if (response.success) {
        crashlytics().log("User signed up successfully");
        Alert.alert(
          "Verification Email Sent",
          "Please check your email to verify your account before logging in.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/auth/login"),
            },
          ]
        );
      }
      return response;
    }, "Sign Up Failed");
    return result;
  };

  const signIn = async (email: string, password: string) => {
    const result = await performAuthOperation(async () => {
      const response = await signInWithEmail(email, password, dispatch);
      if (response.success) {
        crashlytics().log("User signed in with email");
        router.replace("/dashboard");
      }
      return response;
    }, "Login Failed");
    return result;
  };

  const signInWithSocial = async (provider: "google" | "apple") => {
    const result = await performAuthOperation(async () => {
      const response = await signInWithSocialProvider(provider, dispatch);
      if (response.success) {
        crashlytics().log(`User signed in with ${provider}`);
        router.replace("/dashboard");
      }
      return response;
    }, `${provider} Login Failed`);
    return result;
  };

  const handleSignOut = async () => {
    const result = await performAuthOperation(async () => {
      const response = await signOut(dispatch);
      if (response.success) {
        crashlytics().log("User signed out");
        router.replace("/");
      }
      return response;
    }, "Sign Out Failed");
    return result;
  };

  const handleUpdateProfile = async (currentPassword: string, updates: any) => {
    const result = await performAuthOperation(async () => {
      const response = await updateProfile(currentPassword, updates, dispatch);
      if (response.success) {
        crashlytics().log("User profile updated");
        router.replace("/dashboard/profile");
      }
      return response;
    }, "Profile Update Failed");
    return result;
  };

  const handleUpdatePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    const result = await performAuthOperation(async () => {
      const response = await updatePassword(
        currentPassword,
        newPassword,
        dispatch
      );
      if (response.success) {
        crashlytics().log("User password updated");
        router.replace("/dashboard/profile");
      }
      return response;
    }, "Password Update Failed");
    return result;
  };

  const handleResetPassword = async (email: string) => {
    const result = await performAuthOperation(async () => {
      const response = await resetPassword(email);
      if (response.success) {
        crashlytics().log("Password reset email sent");
        router.replace("/auth/login");
      }
      return response;
    }, "Password Reset Failed");
    return result;
  };

  const handleDeleteAccount = async (currentPassword?: string) => {
    const result = await performAuthOperation(async () => {
      const response = await deleteAccount(currentPassword, dispatch);
      if (response.success) {
        const user = auth().currentUser;
        if (user) {
          crashlytics().log("User account deleted");
          await apiClient.deleteUserProfile(user.uid);
          router.replace("/");
        }
      }
      return response;
    }, "Account Deletion Failed");
    return result;
  };

  const handleReauthenticate = async (
    credential: FirebaseAuthTypes.AuthCredential
  ) => {
    return await performAuthOperation(async () => {
      const response = await reauthenticateUser(credential, dispatch);
      if (response.success) {
        crashlytics().log("User reauthenticated");
      }
      return response;
    }, "Reauthentication Failed");
  };

  return {
    signUp,
    signIn,
    signInWithSocial,
    signOut: handleSignOut,
    updateProfile: handleUpdateProfile,
    updatePassword: handleUpdatePassword,
    resetPassword: handleResetPassword,
    deleteAccount: handleDeleteAccount,
    reauthenticate: handleReauthenticate,
  };
};
