import React from "react";
import { TouchableOpacity, Text, Image, StyleSheet } from "react-native";

interface GoogleSignInButtonProps {
  onPress: () => void;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onPress }) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Image style={styles.icon} source={require("assets/google-logo.png")} />
    <Text style={styles.text}>Sign in with Google</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#707070",
    borderRadius: 20,
    padding: 10,
    marginTop: 20,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  text: {
    fontWeight: "bold",
    color: "#4285F4",
  },
});

export default GoogleSignInButton;
