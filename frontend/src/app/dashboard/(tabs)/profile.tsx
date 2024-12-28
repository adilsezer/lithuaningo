import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useAuth } from "@hooks/useAuth";
import { useAppSelector } from "@redux/hooks";
import { selectUserData, selectIsLoggedIn } from "@redux/slices/userSlice";
import CustomButton from "@components/ui/CustomButton";
import { useRouter } from "expo-router";
import { getCurrentDateKey } from "@utils/dateUtils";
import { clearData } from "@utils/storageUtils";
import ThemeSwitch from "@components/ui/ThemeSwitch";
import { useTheme } from "@context/ThemeContext";
import { SENTENCE_KEYS, QUIZ_KEYS } from "@config/constants";
import { SectionTitle, Subtitle } from "@components/typography";
import { AlertDialog } from "@components/ui/AlertDialog";

const PROFILE_ACTIONS = [
  { title: "Edit Profile", path: "/profile/edit-profile" },
  { title: "Change Password", path: "/profile/change-password" },
  { title: "Delete Account", path: "/profile/delete-account" },
  { title: "Settings", path: "/profile/settings" },
  { title: "About the App", path: "/about" },
] as const;

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();

  const userData = useAppSelector(selectUserData);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleClearProgress = () => {
    AlertDialog.confirm({
      title: "Clear Progress",
      message:
        "Are you sure you want to clear today's progress? This action cannot be undone.",
      confirmText: "Clear",
      confirmStyle: "destructive",
      onConfirm: async () => {
        if (!userData) {
          AlertDialog.error("No user data available");
          return;
        }

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

        await Promise.all(keysToClear.map(clearData));
        AlertDialog.success("Progress data cleared successfully");
      },
    });
  };

  if (!isLoggedIn || !userData) {
    return (
      <View style={styles.container}>
        <SectionTitle>No user data available</SectionTitle>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ThemeSwitch onToggle={toggleTheme} isDarkMode={isDarkMode} />
      <SectionTitle>{userData.name || "User"}</SectionTitle>
      <Subtitle>{userData.email}</Subtitle>

      <View>
        {PROFILE_ACTIONS.map(({ title, path }) => (
          <CustomButton
            key={title}
            title={title}
            onPress={() => handleNavigation(path)}
          />
        ))}
        <CustomButton title="Logout" onPress={signOut} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
