import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Linking, Image } from "react-native";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import { getLatestVersionInfo } from "../../services/data/versionService";
import CustomButton from "@components/CustomButton";

const UpdateScreen: React.FC = () => {
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();
  const [updateUrl, setUpdateUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchVersionInfo = async () => {
      const versionInfo = await getLatestVersionInfo();
      if (versionInfo) {
        setUpdateUrl(versionInfo.updateUrl);
      }
    };

    fetchVersionInfo();
  }, []);

  if (!updateUrl) {
    return (
      <View style={styles.container}>
        <Text style={globalStyles.title}>Error</Text>
        <Text style={globalStyles.subtitle}>
          Unable to retrieve update information. Please try again later.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={require("../../../assets/images/icon.png")}
        style={styles.logo}
      />
      <Text style={globalStyles.title}>Update Available</Text>
      <Text style={globalStyles.subtitle}>
        A new version of Lithuaningo is available. Please update to continue.
      </Text>
      <CustomButton
        onPress={() => {
          Linking.openURL(updateUrl).catch((err) =>
            console.error("Failed to open URL:", err)
          );
        }}
        title="Update Now"
      ></CustomButton>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    borderRadius: 20,
    alignSelf: "center",
  },
});

export default UpdateScreen;
