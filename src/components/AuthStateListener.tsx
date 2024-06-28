import React, { useEffect } from "react";
import auth from "@react-native-firebase/auth";
import { logIn, logOut } from "@src/redux/slices/userSlice";
import { useAppDispatch } from "@src/redux/hooks";
import { useRouter } from "expo-router"; // Import useRouter

const AuthStateListener: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter(); // Initialize useRouter

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
