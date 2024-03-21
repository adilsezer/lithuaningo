// /app/(root)/index.tsx

import React from "react";
import { View, Text, Button } from "react-native";
import { useAppDispatch, useAppSelector } from "../../store/hooks"; // Import useAppSelector
import { logOut, selectUserData } from "../../features/auth/redux/userSlice"; // Import selectUserData
import { router } from "expo-router";
import { useThemeStyles } from "@src/hooks/useThemeStyles";

const HomeScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const userData = useAppSelector(selectUserData); // Use selectUserData to get the user's data
  const { styles: globalStyles } = useThemeStyles();

  const handleLogout = () => {
    dispatch(logOut());
    router.replace("auth/login");
  };

  return (
    <View style={globalStyles.viewContainer}>
      <Text style={globalStyles.text}>Dashboard</Text>
      {/* Display the user's name if userData is not null */}
      {userData && (
        <Text style={globalStyles.text}>Welcome, {userData.name}!</Text>
      )}
      <Button title="Logout" onPress={handleLogout} />
      {/* Placeholder for actual dashboard content */}
    </View>
  );
};

export default HomeScreen;
