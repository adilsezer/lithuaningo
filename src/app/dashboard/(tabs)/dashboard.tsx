// /app/(root)/index.tsx

import React from "react";
import { Text, Button } from "react-native";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { selectUserData } from "../../../redux/slices/userSlice";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthMethods } from "@src/hooks/useAuthMethods";
import { setLoading } from "@src/redux/slices/uiSlice";

const DashboardScreen: React.FC = () => {
  const userData = useAppSelector(selectUserData);
  const { styles: globalStyles } = useThemeStyles();
  const dispatch = useAppDispatch();

  const { handleSignOut } = useAuthMethods();

  const logout = async () => {
    dispatch(setLoading(true));
    await handleSignOut();
    dispatch(setLoading(false));
  };

  return (
    <SafeAreaView style={globalStyles.viewContainer}>
      <Text style={globalStyles.text}>Dashboard</Text>
      {userData && (
        <Text style={globalStyles.text}>
          Welcome, {userData.name || userData.email}!
        </Text>
      )}
      <Button title="Logout" onPress={logout} />
    </SafeAreaView>
  );
};

export default DashboardScreen;
