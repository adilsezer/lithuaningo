import React, { useEffect } from "react";
import auth from "@react-native-firebase/auth";
import { useUserStore } from "@stores/useUserStore";
import { useRouter } from "expo-router";
import {
  updateUserState,
  sendEmailVerification,
} from "@services/auth/authService";
import { useAlertDialog } from "@components/ui/AlertDialog";

const AuthStateListener: React.FC = () => {
  const { logOut } = useUserStore();
  const alertDialog = useAlertDialog();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      if (user && user.email) {
        if (!user.emailVerified) {
          // If email is not verified, sign out and show message
          await auth().signOut();
          logOut();
          alertDialog.show({
            title: "Email Not Verified",
            message:
              "Please verify your email before logging in. Need a new verification email?",
            buttons: [
              {
                text: "Send Email",
                onPress: async () => {
                  await sendEmailVerification();
                },
              },
              { text: "Cancel", onPress: () => {} },
            ],
          });
          router.replace("/auth/login");
          return;
        }
        await updateUserState(user);
      } else {
        logOut();
        router.replace("/");
      }
    });

    return () => unsubscribe();
  }, [logOut, router]);

  return null;
};

export default AuthStateListener;
