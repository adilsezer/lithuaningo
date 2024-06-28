import React, { useEffect } from "react";
import auth from "@react-native-firebase/auth";
import { logIn, logOut } from "@src/redux/slices/userSlice";
import { useAppDispatch } from "@src/redux/hooks";

const AuthStateListener: React.FC = () => {
  const dispatch = useAppDispatch();

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
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return null;
};

export default AuthStateListener;
