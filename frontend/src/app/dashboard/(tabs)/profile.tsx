import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useAuth } from "@hooks/useAuth";
import { useUserData, useIsLoggedIn } from "@stores/useUserStore";
import CustomButton from "@components/ui/CustomButton";
import { useRouter } from "expo-router";
import { getCurrentDateKey } from "@utils/dateUtils";
import { clearData } from "@utils/storageUtils";
import CustomSwitch from "@components/ui/CustomSwitch";
import { SENTENCE_KEYS, QUIZ_KEYS } from "@config/constants";
import { useTheme } from "react-native-paper";
import CustomText from "@components/ui/CustomText";
import { useTheme as useThemeContext } from "@context/ThemeContext";
import { useAlertDialog } from "@hooks/useAlertDialog";
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
  name,
  email,
}: {
  name: string | null;
  email: string;
}) => (
  <>
    <CustomText variant="titleLarge" bold>
      {name || "User"}
    </CustomText>
    <CustomText variant="bodyLarge">{email}</CustomText>
  </>
);

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const theme = useTheme();
  const { toggleTheme } = useThemeContext();
  const darkMode = theme.dark;
  const router = useRouter();

  const userData = useUserData();
  const isLoggedIn = useIsLoggedIn();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const { showConfirm, showError, showSuccess } = useAlertDialog();

  const handleClearProgress = async () => {
    if (!userData) {
      showError("No user data available");
      return;
    }

    showConfirm({
      title: "Clear Progress",
      message:
        "Are you sure you want to clear today's progress? This action cannot be undone.",
      confirmText: "Clear",
      onConfirm: async () => {
        const currentDateKey = getCurrentDateKey();
        const keysToClear = [
          SENTENCE_KEYS.COMPLETION_STATUS_KEY(userData.id, currentDateKey),
          SENTENCE_KEYS.SENTENCES_KEY(userData.id, currentDateKey),
          QUIZ_KEYS.QUIZ_PROGRESS_KEY(userData.id, currentDateKey),
          QUIZ_KEYS.QUIZ_QUESTIONS_KEY(userData.id, currentDateKey),
          QUIZ_KEYS.INCORRECT_QUESTIONS_KEY(userData.id, currentDateKey),
          QUIZ_KEYS.INCORRECT_PROGRESS_KEY(userData.id, currentDateKey),
          QUIZ_KEYS.SESSION_STATE_KEY(userData.id, currentDateKey),
        ];

        try {
          await Promise.all(keysToClear.map(clearData));
          showSuccess("Progress data cleared successfully");
        } catch (error) {
          showError("Failed to clear progress data");
        }
      },
    });
  };

  if (!isLoggedIn || !userData) {
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
        value={darkMode}
        label="Dark Mode"
      />

      <CustomDivider />

      <ProfileHeader name={userData.name} email={userData.email} />

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
