import { useCallback } from "react";
import { useAppDispatch } from "../redux/hooks";
import { getErrorMessage } from "../utils/errorMessages";
import { useRouter } from "expo-router";
import crashlytics from "@react-native-firebase/crashlytics"; // Import Crashlytics
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
import {
  signInWithGoogle,
  getGoogleCredential,
} from "@src/services/auth/googleAuthService";
import {
  signInWithApple,
  getAppleCredential,
} from "@src/services/auth/appleAuthService";
import firestore from "@react-native-firebase/firestore";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";

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
        // Log the error to Crashlytics
        crashlytics().recordError(error);
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

      // Log the sign-up action
      crashlytics().setUserId(user.uid); // Log only user ID
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

        // Log the sign-in action
        crashlytics().setUserId(user.uid); // Log only user ID
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

      // Log the Google sign-in action
      crashlytics().setUserId(user.uid); // Log only user ID
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

      // Log the Apple sign-in action
      crashlytics().setUserId(user.uid); // Log only user ID
    };
    return await handleAction(action, "/dashboard");
  };

  const handleSignOut = async () => {
    const result = await handleAction(() => signOutUser(dispatch), "/");
    if (result.success) {
      // Log the sign-out action
      crashlytics().log("User signed out."); // Minimal log
    }
    return result;
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

  const handleUpdateUserProfile = async (
    currentPassword: string,
    updates: { displayName?: string }
  ) => {
    const action = async () => {
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
      await updateUserProfile(updates, dispatch);

      if (updates.displayName) {
        await firestore()
          .collection("userProfiles")
          .doc(user.uid)
          .update({ name: updates.displayName });
      }

      // Log the profile update action
      crashlytics().setUserId(user.uid); // Log only user ID
    };

    const result = await handleAction(action, "/dashboard/profile");
    if (result.success) {
      result.message = "Profile updated successfully.";
    }
    return result;
  };

  const handleUpdateUserPassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    const action = async () => {
      const user = auth().currentUser;
      if (!user) {
        throw new Error("No user is currently signed in.");
      }

      // Reauthenticate user with current password
      const credential = auth.EmailAuthProvider.credential(
        user.email!,
        currentPassword
      );
      await reauthenticateUser(credential, dispatch);

      // Update password
      await updateUserPassword(newPassword, dispatch);

      // Log the password update action
      crashlytics().setUserId(user.uid); // Log only user ID
    };

    const result = await handleAction(action, "/dashboard/profile");
    if (result.success) {
      result.message = "Password updated successfully.";
    }
    return result;
  };

  const handleDeleteUserAccount = async (password?: string) => {
    const action = async () => {
      const user = auth().currentUser;
      if (!user) {
        throw new Error("No user is currently signed in.");
      }

      let credential: FirebaseAuthTypes.AuthCredential | undefined;

      if (
        user.providerData.some((provider) => provider.providerId === "password")
      ) {
        // If user signed in with email and password
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

      // Reauthenticate user
      await reauthenticateUser(credential, dispatch);

      // Delete user document from Firestore
      await firestore().collection("userProfiles").doc(user.uid).delete();

      // Delete user
      await deleteUser(dispatch);

      // Log the account deletion action
      crashlytics().setUserId(user.uid); // Log only user ID
    };

    const result = await handleAction(action, "/");
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
