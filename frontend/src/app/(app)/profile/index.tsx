import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useAuth } from "@hooks/useAuth";
import { useUserData, useIsAuthenticated } from "@stores/useUserStore";
import CustomButton from "@components/ui/CustomButton";
import { useRouter } from "expo-router";
import CustomSwitch from "@components/ui/CustomSwitch";
import CustomText from "@components/ui/CustomText";
import { useIsDarkMode, useThemeActions } from "@stores/useThemeStore";
import CustomDivider from "@components/ui/CustomDivider";

const PROFILE_ACTIONS = [
  { title: "Edit Profile", path: "/profile/edit-profile" },
  { title: "Change Password", path: "/profile/change-password" },
  { title: "Delete Account", path: "/profile/delete-account" },
  { title: "Settings", path: "/profile/settings" },
  { title: "About the App", path: "/about" },
] as const;

const ProfileActions = ({
  onNavigate,
}: {
  onNavigate: (path: string) => void;
}) => (
  <View>
    {PROFILE_ACTIONS.map(({ title, path }) => (
      <CustomButton
        key={title}
        title={title}
        onPress={() => onNavigate(path)}
      />
    ))}
  </View>
);

const ProfileHeader = ({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) => (
  <>
    <CustomText variant="titleLarge" bold>
      {fullName}
    </CustomText>
    <CustomText variant="bodyLarge">{email}</CustomText>
  </>
);

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { toggleTheme } = useThemeActions();
  const isDarkMode = useIsDarkMode();
  const router = useRouter();

  const userData = useUserData();
  const isAuthenticated = useIsAuthenticated();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  if (!isAuthenticated || !userData) {
    return (
      <View style={[styles.container]}>
        <CustomText>No user data available</CustomText>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <CustomSwitch
        onValueChange={toggleTheme}
        value={isDarkMode}
        label="Dark Mode"
      />

      <CustomDivider />

      <ProfileHeader
        fullName={userData?.fullName || "No name"}
        email={userData?.email || "No email"}
      />

      <ProfileActions onNavigate={handleNavigation} />

      <CustomButton title="Logout" onPress={signOut} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
