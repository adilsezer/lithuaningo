import React from "react";
import { View, Text, ScrollView, StyleSheet, Alert } from "react-native";
import useAuthMethods from "@src/hooks/useAuthMethods";
import { useAppDispatch, useAppSelector } from "@src/redux/hooks";
import { selectUserData, selectIsLoggedIn } from "@src/redux/slices/userSlice";
import CustomButton from "@components/CustomButton";
import { useRouter } from "expo-router";
import { setLoading } from "@src/redux/slices/uiSlice";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import { getCurrentDateKey } from "@utils/dateUtils";
import { clearData } from "@utils/storageUtils";
import ThemeSwitch from "@components/ThemeSwitch"; // Import ThemeSwitch
import { useTheme } from "@src/context/ThemeContext"; // Import useTheme
import crashlytics from "@react-native-firebase/crashlytics"; // Add this import

export default function ProfileScreen() {
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const dispatch = useAppDispatch();
  const { handleSignOut } = useAuthMethods();
  const router = useRouter();

  const { isDarkMode, toggleTheme } = useTheme(); // Use theme context

  const logout = async () => {
    dispatch(setLoading(true));
    await handleSignOut();
    dispatch(setLoading(false));
  };

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const userData = useAppSelector(selectUserData);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);

  const handleClearCompletionStatus = async () => {
    const COMPLETION_STATUS_KEY = `completionStatus_${
      userData?.id
    }_${getCurrentDateKey()}`;
    const SENTENCES_KEY = `sentences_${userData?.id}_${getCurrentDateKey()}`;
    const QUIZ_PROGRESS_KEY = `quizProgress_${
      userData?.id
    }_${getCurrentDateKey()}`;
    const QUESTIONS_KEY = `questions_${userData?.id}_${getCurrentDateKey()}`;
    const INCORRECT_QUESTIONS_KEY = `incorrectQuestions_${
      userData?.id
    }_${getCurrentDateKey()}`;

    await clearData(COMPLETION_STATUS_KEY);
    await clearData(QUIZ_PROGRESS_KEY);
    await clearData(SENTENCES_KEY);
    await clearData(QUESTIONS_KEY);
    await clearData(INCORRECT_QUESTIONS_KEY);
    Alert.alert("Removed Progress Data");
  };

  if (!isLoggedIn || !userData) {
    return (
      <View style={styles.container}>
        <Text style={globalStyles.title}>No user data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ThemeSwitch onToggle={toggleTheme} isDarkMode={isDarkMode} />
      <Text style={globalStyles.title}>{userData.name || "User"}</Text>
      <Text style={globalStyles.subtitle}>{userData.email}</Text>

      <View style={styles.actionsSection}>
        <CustomButton
          title="Edit Profile"
          onPress={() => navigateTo("/profile/edit-profile")}
        />
        <CustomButton
          title="Change Password"
          onPress={() => navigateTo("/profile/change-password")}
        />
        <CustomButton
          title="Delete Account"
          onPress={() => navigateTo("/profile/delete-account")}
        />
        <CustomButton
          title="About the App"
          onPress={() => navigateTo("/about")}
        />
        {__DEV__ && (
          <CustomButton
            title="Clear Completion Status"
            onPress={handleClearCompletionStatus}
          />
        )}
        <CustomButton
          title="Test Crash"
          onPress={() => crashlytics().crash()}
        />
        <CustomButton title="Logout" onPress={logout} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  actionsSection: {
    marginTop: 10,
  },
});
