import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useAppDispatch } from "../../../store/hooks"; // Adjust the path as necessary
import { signInWithEmail } from "../services/FirebaseAuthService"; // Adjust the path as necessary

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const dispatch = useAppDispatch();

  const handleLogin = async () => {
    try {
      await signInWithEmail(email, password, dispatch);
      console.log("Login successful");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Log In" onPress={handleLogin} />
      {/* Using Button directly */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "gray",
    padding: 10,
    marginBottom: 20,
  },
});

export default LoginScreen;
