// /app/(root)/index.tsx

import React from "react";
import { Text, Button } from "react-native";
import { useAppSelector } from "../../redux/hooks";
import { selectUserData } from "../../redux/slices/userSlice";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthMethods } from "@src/hooks/useAuthMethods";

const DashboardScreen: React.FC = () => {
  const userData = useAppSelector(selectUserData);
  const { styles: globalStyles } = useThemeStyles();

  const { handleSignOut } = useAuthMethods();

  return (
    <SafeAreaView style={globalStyles.viewContainer}>
      <Text style={globalStyles.text}>Dashboard</Text>
      {userData && (
        <Text style={globalStyles.text}>
          Welcome, {userData.name || userData.email}!
        </Text>
      )}
      <Button title="Logout" onPress={handleSignOut} />
    </SafeAreaView>
  );
};

export default DashboardScreen;
