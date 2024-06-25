import auth from "@react-native-firebase/auth";
import { useCallback } from "react";
import { useAppDispatch } from "../redux/hooks";
import { getErrorMessage } from "../utils/errorMessages";
import { useRouter } from "expo-router";
import {
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
  sendPasswordResetEmail,
  updateUserProfile,
  sendEmailVerification,
  updateUserPassword,
  deleteUser,
  reauthenticateUser,
} from "@src/services/auth/firebaseAuthService";
import { signInWithGoogle } from "@src/services/auth/googleAuthService";
import { signInWithApple } from "@src/services/auth/appleAuthService"; // Import Apple Sign-In service
import firestore from "@react-native-firebase/firestore";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";

type ActionHandler<T = void> = () => Promise<T>;

const useAuthMethods = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleAction = useCallback(
    async <T>(
      action: ActionHandler<T>,
      successPath?: string
    ): Promise<{ success: boolean; message?: string; result?: T }> => {
      try {
        const result = await action();
        if (successPath) {
          router.replace(successPath);
        }
        return { success: true, result };
      } catch (error: any) {
        return {
          success: false,
          message: error.code ? getErrorMessage(error.code) : error.message,
        };
      }
    },
    [router, dispatch]
  );

  const handleSignUpWithEmail = async (
    email: string,
    password: string,
    name: string
  ) => {
    const action = async () => {
      const { user } = await signUpWithEmail(email, password, dispatch);
      await user.updateProfile({ displayName: name });
      await sendEmailVerification();
    };
    const result = await handleAction(action, "/auth/login");
    if (result.success) {
      result.message =
        "Registration successful! Please verify your email to continue.";
    }
    return result;
  };

  const handleLoginWithEmail = async (email: string, password: string) => {
    const action = async () => {
      const userCredential = await signInWithEmail(email, password, dispatch);
      const user = userCredential.user;

      if (user) {
        const userDoc = await firestore()
          .collection("userProfiles")
          .doc(user.uid)
          .get();
        if (!userDoc.exists) {
          await firestore()
            .collection("userProfiles")
            .doc(user.uid)
            .set({
              name: user.displayName || "No Name",
              email: user.email,
            });
        }
      } else {
        throw new Error("User does not exist.");
      }
    };

    return await handleAction(action, "/dashboard");
  };

  const handleLoginWithGoogle = async () => {
    const action = async () => {
      const userCredential = await signInWithGoogle(dispatch);
      const user = userCredential.user;

      const userDoc = await firestore()
        .collection("userProfiles")
        .doc(user.uid)
        .get();
      if (!userDoc.exists) {
        await firestore()
          .collection("userProfiles")
          .doc(user.uid)
          .set({
            name: user.displayName || "No Name",
            email: user.email,
          });
      }
    };
    return await handleAction(action, "/dashboard");
  };

  const handleLoginWithApple = async () => {
    const action = async () => {
      const userCredential = await signInWithApple(dispatch);
      const user = userCredential.user;

      const userDoc = await firestore()
        .collection("userProfiles")
        .doc(user.uid)
        .get();
      if (!userDoc.exists) {
        await firestore()
          .collection("userProfiles")
          .doc(user.uid)
          .set({
            name: user.displayName || "No Name",
            email: user.email,
          });
      }
    };
    return await handleAction(action, "/dashboard");
  };

  const handleSignOut = async () => {
    return await handleAction(() => signOutUser(dispatch), "/");
  };

  const handlePasswordReset = async (email: string) => {
    const result = await handleAction(
      () => sendPasswordResetEmail(email),
      "/auth/login"
    );
    if (result.success) {
      result.message = "Password reset email sent. Please check your inbox.";
    }
    return result;
  };

  const handleUpdateUserProfile = async (updates: { displayName?: string }) => {
    const result = await handleAction(async () => {
      await updateUserProfile(updates, dispatch);
      const user = auth().currentUser;
      if (user && updates.displayName) {
        await firestore()
          .collection("userProfiles")
          .doc(user.uid)
          .update({ name: updates.displayName });
      }
    });
    if (result.success) {
      result.message = "Profile updated successfully.";
    }
    return result;
  };

  const handleUpdateUserPassword = async (newPassword: string) => {
    const result = await handleAction(() =>
      updateUserPassword(newPassword, dispatch)
    );
    if (result.success) {
      result.message = "Password updated successfully.";
    }
    return result;
  };

  const handleDeleteUserAccount = async () => {
    const result = await handleAction(() => deleteUser(dispatch));
    if (result.success) {
      result.message = "Account deleted successfully.";
    }
    return result;
  };

  const handleReauthenticateUser = async (
    credential: FirebaseAuthTypes.AuthCredential
  ) => {
    const result = await handleAction(() =>
      reauthenticateUser(credential, dispatch)
    );
    if (result.success) {
      result.message = "User re-authenticated successfully.";
    }
    return result;
  };

  return {
    handleSignUpWithEmail,
    handleLoginWithEmail,
    handleLoginWithGoogle,
    handleLoginWithApple, // Add Apple login handler
    handleSignOut,
    handlePasswordReset,
    handleUpdateUserProfile,
    handleUpdateUserPassword,
    handleDeleteUserAccount,
    handleReauthenticateUser,
  };
};

export default useAuthMethods;
