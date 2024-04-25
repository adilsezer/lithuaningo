// /app/(root)/index.tsx

import React from "react";
import { Text, Button } from "react-native";
import { useAppSelector } from "../../redux/hooks"; // Import useAppSelector
import { selectUserData } from "../../redux/slices/userSlice"; // Import selectUserData
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthMethods } from "@src/hooks/useAuthMethods";

const DashboardScreen: React.FC = () => {
  const userData = useAppSelector(selectUserData); // Use selectUserData to get the user's data
  const { styles: globalStyles } = useThemeStyles();

  const { handleSignOut } = useAuthMethods();

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
