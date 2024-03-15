import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useAppDispatch } from "../../../store/hooks";
import { signInWithEmail } from "../services/FirebaseAuthService";
import { signInWithGoogle } from "../services/GoogleAuthService";
import GoogleSignInButton from "@components/GoogleSignInButton";
import ErrorMessage from "@components/ErrorMessage";
import { AuthErrorMessages } from "../utilities/AuthErrorMessages";

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const dispatch = useAppDispatch();

  const handleLoginWithEmail = async () => {
    setLoading(true);
    setError(""); // Clear any existing errors
    try {
      await signInWithEmail(email, password, dispatch);
    } catch (error: any) {
      console.error("Error signing in: ", error.code, error.message);
      const errorMessage = AuthErrorMessages.getErrorMessage(error.code);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginWithGoogle = async () => {
    setLoading(true);
    setError(""); // Clear any existing errors
    try {
      await signInWithGoogle(dispatch);
    } catch (error: any) {
      // Similar handling for Google sign-in errors
      const errorMessage =
        error?.message || "An unexpected error occurred. Please try again.";
      setError(`Failed to log in with Google: ${errorMessage}`);
    } finally {
      setLoading(false);
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
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />
      {loading ? (
        <ActivityIndicator size="small" color="#0000ff" />
      ) : (
        <>
          <Button title="Log In with Email" onPress={handleLoginWithEmail} />
          <View style={styles.separator}>
            <View style={styles.line} />
            <Text style={styles.orText}>Or</Text>
            <View style={styles.line} />
          </View>
          <GoogleSignInButton onPress={handleLoginWithGoogle} />
        </>
      )}
      {error && <ErrorMessage message={error} />}
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
    margin: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
  },
  separator: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },
  orText: {
    width: 50,
    textAlign: "center",
  },
});

export default LoginScreen;
