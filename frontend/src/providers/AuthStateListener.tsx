import React, { useEffect } from "react";
import auth from "@react-native-firebase/auth";
import { logIn, logOut } from "@redux/slices/userSlice";
import { useAppDispatch } from "@redux/hooks";
import { useRouter } from "expo-router";
import {
  updateUserState,
  sendEmailVerification,
} from "@services/auth/authService";
import { AlertDialog } from "@components/ui/AlertDialog";

const AuthStateListener: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      if (user && user.email) {
        if (!user.emailVerified) {
          // If email is not verified, sign out and show message
          await auth().signOut();
          dispatch(logOut());
          AlertDialog.show({
            title: "Email Not Verified",
            message:
              "Please verify your email before logging in. Need a new verification email?",
            buttons: [
              {
                text: "Send Email",
                onPress: async () => {
                  await sendEmailVerification(dispatch);
                },
              },
              { text: "Cancel", style: "cancel" },
            ],
          });
          router.replace("/auth/login");
          return;
        }
        await updateUserState(user, dispatch);
      } else {
        dispatch(logOut());
        router.replace("/");
      }
    });

    return () => unsubscribe();
  }, [dispatch, router]);

  return null;
};

export default AuthStateListener;
