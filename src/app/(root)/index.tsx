// /app/(root)/index.tsx

import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { useAppDispatch, useAppSelector } from "../../store/hooks"; // Import useAppSelector
import { logOut, selectUserData } from "../../features/auth/redux/userSlice"; // Import selectUserData
import { router } from "expo-router";

const DashboardScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const userData = useAppSelector(selectUserData); // Use selectUserData to get the user's data

  const handleLogout = () => {
    dispatch(logOut());
    router.push("/auth");
  };

  return (
    <View style={styles.container}>
      <Text>Dashboard</Text>
      {/* Display the user's name if userData is not null */}
      {userData && <Text>Welcome, {userData.name}!</Text>}
      <Button title="Logout" onPress={handleLogout} />
      {/* Placeholder for actual dashboard content */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DashboardScreen;
