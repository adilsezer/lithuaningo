import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import { useAuth } from "@hooks/useAuth";
import { createTheme } from "@src/styles/theme";
import { useIsDarkMode } from "@stores/useThemeStore";

export default function HomeScreen() {
  const { signOut } = useAuth();
  const isDarkMode = useIsDarkMode();
  const theme = createTheme(isDarkMode);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text style={[styles.title, { color: theme.colors.onBackground }]}>
        Welcome to Lithuaningo
      </Text>

      <Text style={[styles.description, { color: theme.colors.onBackground }]}>
        You are now signed in to your account.
      </Text>

      <View style={styles.buttonContainer}>
        <Button mode="contained" onPress={signOut} style={styles.button}>
          Sign Out
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 300,
  },
  button: {
    marginVertical: 8,
  },
});
