// /app/(root)/index.tsx

import React from "react";
import { Text, Button } from "react-native";
import { useAppDispatch, useAppSelector } from "../../store/hooks"; // Import useAppSelector
import { logOut, selectUserData } from "../../features/auth/redux/userSlice"; // Import selectUserData
import { router } from "expo-router";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthMethods } from "@src/hooks/useAuthMethods";

const DashboardScreen: React.FC = () => {
  const userData = useAppSelector(selectUserData); // Use selectUserData to get the user's data
  const { styles: globalStyles } = useThemeStyles();

  const { handleSignOut, loading, error } = useAuthMethods();

  return (
    <SafeAreaView style={globalStyles.viewContainer}>
      <Text style={globalStyles.text}>Dashboard</Text>
      {/* Display the user's name if userData is not null */}
      {userData && (
        <Text style={globalStyles.text}>
          Welcome, {userData.name || userData.email}!
        </Text>
      )}
      <Button title="Logout" onPress={handleSignOut} />
      {/* Placeholder for actual dashboard content */}
    </SafeAreaView>
  );
};

export default DashboardScreen;
