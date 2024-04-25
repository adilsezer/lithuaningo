import React from "react";
import { Redirect, Slot, Stack } from "expo-router";
import { useAppSelector } from "../../redux/hooks";

const AppLayout: React.FC = () => {
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);

  if (isLoggedIn) {
    return <Redirect href="/dashboard/(tabs)" />;
  }

  return <Slot />;
};

export default AppLayout;
