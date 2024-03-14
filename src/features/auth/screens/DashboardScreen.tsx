import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { useAppDispatch } from "../../../store/hooks";
import { logOut } from "../slices/userSlice";
import { Link } from "expo-router";

const DashboardScreen: React.FC = () => {
  const dispatch = useAppDispatch();

  const handleLogin = () => {
    // Dispatch the logIn action with dummy data
    dispatch(logOut());
  };

  return (
    <View style={styles.container}>
      <Text>Dashboard</Text>
      <Button title="Logout" onPress={handleLogin} />
      <Link href="/about">About</Link>
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
