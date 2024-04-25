import React from "react";
import { Redirect, Slot } from "expo-router";
import { useAppSelector } from "../../redux/hooks";

const AppLayout: React.FC = () => {
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);

  if (isLoggedIn) {
    return <Redirect href="/dashboard" />;
  }

  return <Slot />;
};

export default AppLayout;
