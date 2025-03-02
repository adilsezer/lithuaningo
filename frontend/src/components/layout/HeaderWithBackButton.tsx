import React from "react";
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useTheme, IconButton } from "react-native-paper";
import { router } from "expo-router";
import CustomText from "@components/ui/CustomText";

interface HeaderWithBackButtonProps {
  title: string;
  onBackPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  showBackButton?: boolean;
}

const HeaderWithBackButton: React.FC<HeaderWithBackButtonProps> = ({
  title,
  onBackPress,
  containerStyle,
  titleStyle,
  showBackButton = true,
}) => {
  const theme = useTheme();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
        containerStyle,
      ]}
    >
      <View style={styles.headerContent}>
        {showBackButton && (
          <View style={styles.backButtonContainer}>
            <IconButton
              icon="arrow-left"
              size={24}
              onPress={handleBackPress}
              style={styles.backButton}
            />
          </View>
        )}
        <View style={styles.titleContainer}>
          <CustomText
            variant="titleLarge"
            bold
            style={[styles.title, titleStyle]}
          >
            {title}
          </CustomText>
        </View>
        {/* Empty view to balance the layout */}
        {showBackButton && <View style={styles.backButtonContainer} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  backButtonContainer: {
    width: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    margin: 0,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
  },
});

export default HeaderWithBackButton;
