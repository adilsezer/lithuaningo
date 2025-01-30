import React, { useEffect, useCallback, useRef } from "react";
import auth from "@react-native-firebase/auth";
import { useUserStore } from "@stores/useUserStore";
import { useRouter } from "expo-router";
import {
  updateUserState,
  sendEmailVerification,
} from "@services/auth/authService";
import { useAlertDialog } from "@hooks/useAlertDialog";

const AuthStateListener: React.FC = () => {
  const { logOut } = useUserStore();
  const { showAlert } = useAlertDialog();
  const router = useRouter();
  const isProcessing = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleUnverifiedEmail = useCallback(async () => {
    if (isProcessing.current || !isMounted.current) return;
    isProcessing.current = true;

    try {
      await auth().signOut();
      if (!isMounted.current) return;

      logOut();
      showAlert({
        title: "Email Not Verified",
        message:
          "Please verify your email before logging in. Need a new verification email?",
        buttons: [
          {
            text: "Send Email",
            onPress: async () => {
              if (!isMounted.current) return;
              await sendEmailVerification();
            },
          },
          { text: "Cancel", onPress: () => {} },
        ],
      });
      if (isMounted.current) {
        router.replace("/auth/login");
      }
    } finally {
      if (isMounted.current) {
        isProcessing.current = false;
      }
    }
  }, [logOut, showAlert, router]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupAuthListener = async () => {
      if (!isMounted.current) return;

      unsubscribe = auth().onAuthStateChanged(async (user) => {
        if (!isMounted.current || isProcessing.current) return;

        try {
          if (user && user.email) {
            if (!user.emailVerified) {
              await handleUnverifiedEmail();
              return;
            }
            if (isMounted.current) {
              await updateUserState(user);
            }
          } else if (isMounted.current) {
            logOut();
            router.replace("/");
          }
        } catch (error) {
          console.error("Auth state change error:", error);
        }
      });
    };

    setupAuthListener();

    return () => {
      isMounted.current = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [logOut, router, handleUnverifiedEmail]);

  return null;
};

export default AuthStateListener;
