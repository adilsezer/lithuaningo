import React, { useEffect } from "react";
import auth from "@react-native-firebase/auth";
import { useUserStore } from "@stores/useUserStore";
import { useRouter } from "expo-router";
import { updateUserState } from "@services/auth/authService";
import { useAlertActions } from "@stores/useAlertStore";
import crashlytics from "@react-native-firebase/crashlytics";

/**
 * Service component that listens to Firebase authentication state changes
 * and updates the app state accordingly. Auth business logic (like email verification)
 * is handled by the auth service, this component only syncs the state.
 */
const AuthInitializer: React.FC = () => {
  const { logOut } = useUserStore();
  const { showAlert } = useAlertActions();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      try {
        if (user) {
          // Set user ID in Crashlytics for better error tracking
          crashlytics().setUserId(user.uid);

          // Let updateUserState handle the state update and verification logic
          await updateUserState(user);
          crashlytics().log("User state updated successfully");
        } else {
          crashlytics().log("No authenticated user found");
          logOut();
          router.replace("/");
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        if (error instanceof Error) {
          crashlytics().recordError(error);
        } else {
          crashlytics().recordError(new Error(String(error)));
        }

        showAlert({
          title: "Authentication Error",
          message:
            "There was a problem with your authentication. Please try again.",
          buttons: [
            { text: "OK", onPress: () => router.replace("/auth/login") },
          ],
        });
      }
    });

    return () => unsubscribe();
  }, [logOut, router, showAlert]);

  return null;
};

export default AuthInitializer;
