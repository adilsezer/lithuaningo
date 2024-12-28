import React, { useEffect } from "react";
import { Platform, ScrollView } from "react-native";
import Divider from "@components/ui/Divider";
import CustomButton from "@components/ui/CustomButton";
import { useAuth } from "@hooks/useAuth";
import BackButton from "@components/layout/BackButton";
import { useAppSelector } from "@redux/hooks";
import { selectIsLoading } from "@redux/slices/uiSlice";
import AppleSignInButton from "@components/auth/AppleSignInButton";
import CustomTextInput from "@components/ui/CustomTextInput";
import crashlytics from "@react-native-firebase/crashlytics";
import { SectionTitle } from "@components/typography";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { AlertDialog } from "@components/ui/AlertDialog";

const SignUpScreen: React.FC = () => {
  const [email, setEmail] = React.useState<string>("");
  const [displayName, setDisplayName] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [confirmPassword, setConfirmPassword] = React.useState<string>("");
  const loading = useAppSelector(selectIsLoading);
  const { colors } = useThemeStyles();
  const { signUp, signInWithSocial } = useAuth();

  const handleSignUp = () => {
    if (confirmPassword !== password) {
      AlertDialog.error("Passwords don't match");
      return;
    } else if (!displayName) {
      AlertDialog.error("Please enter a name");
      return;
    }
    signUp(email, password, displayName);
  };

  useEffect(() => {
    crashlytics().log("Sign up screen loaded.");
  }, []);

  return (
    <ScrollView>
      <BackButton />
      <SectionTitle>Create Account</SectionTitle>

      <CustomTextInput
        placeholder="Name"
        value={displayName}
        onChangeText={setDisplayName}
        autoCapitalize="none"
        placeholderTextColor={colors.placeholder}
      />
      <CustomTextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor={colors.placeholder}
      />
      <CustomTextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor={colors.placeholder}
      />
      <CustomTextInput
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        placeholderTextColor={colors.placeholder}
      />

      <CustomButton onPress={handleSignUp} title="Sign Up" disabled={loading} />

      <Divider content="Or" />

      <CustomButton
        onPress={() => signInWithSocial("google")}
        title="Continue with Google"
        icon={require("assets/images/google-logo.png")}
        style={{ backgroundColor: colors.card, paddingVertical: 18 }}
        textStyle={{ color: colors.cardText }}
        disabled={loading}
      />

      {Platform.OS === "ios" && (
        <AppleSignInButton
          onPress={() => signInWithSocial("apple")}
          disabled={loading}
        />
      )}
    </ScrollView>
  );
};

export default SignUpScreen;
