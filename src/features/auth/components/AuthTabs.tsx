import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useThemeStyles } from "@src/hooks/useThemeStyles";

const AuthTabs = () => {
  const [selectedTab, setSelectedTab] = useState<"login" | "signup">("login");
  const { styles: globalStyles } = useThemeStyles();

  const handlePress = (tab: "login" | "signup") => {
    setSelectedTab(tab);
    router.push(`/auth/${tab}`);
  };

  return (
    <SafeAreaView style={styles.fullScreen}>
      <View style={globalStyles.tabsContainer}>
        <TouchableOpacity
          style={[
            globalStyles.tab,
            selectedTab === "login"
              ? globalStyles.activeTab
              : globalStyles.inactiveTab,
          ]}
          onPress={() => handlePress("login")}
        >
          <Text
            style={[
              globalStyles.tabText,
              selectedTab === "login" && globalStyles.activeTabText,
            ]}
          >
            Login
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            globalStyles.tab,
            selectedTab === "signup"
              ? globalStyles.activeTab
              : globalStyles.inactiveTab,
          ]}
          onPress={() => handlePress("signup")}
        >
          <Text
            style={[
              globalStyles.tabText,
              selectedTab === "signup" && globalStyles.activeTabText,
            ]}
          >
            Signup
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    width: "100%",
  },
});

export default AuthTabs;
