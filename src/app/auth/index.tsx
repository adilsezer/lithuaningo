// app/auth/index.tsx

import React from "react";
import { View, Button } from "react-native";
import { router } from "expo-router";

const AuthTabs = () => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {/* Use router.push to navigate to the Login screen */}
      <Button title="Login" onPress={() => router.push("/auth/login")} />
      {/* Use router.push to navigate to the Signup screen */}
      <Button title="Signup" onPress={() => router.push("/auth/signup")} />
    </View>
  );
};

export default AuthTabs;
