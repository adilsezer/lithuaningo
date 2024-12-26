import React, { useEffect } from "react";
import auth from "@react-native-firebase/auth";
import { logIn, logOut } from "@redux/slices/userSlice";
import { useAppDispatch } from "@redux/hooks";
import { useRouter } from "expo-router";

const AuthStateListener: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (user && user.email) {
        dispatch(
          logIn({
            id: user.uid,
            name: user.displayName || "No Name",
            email: user.email,
            emailVerified: user.emailVerified,
          })
        );
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
