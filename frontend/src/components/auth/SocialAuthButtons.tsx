import React from 'react';
import { Platform, View, StyleSheet, TextStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import {
  GoogleSocialButton,
  AppleSocialButton,
} from 'react-native-social-buttons';

export const SocialAuthButtons: React.FC<{
  onGooglePress: () => void;
  onApplePress: () => void;
}> = ({ onGooglePress, onApplePress }) => {
  const theme = useTheme();

  const buttonStyles = {
    ...styles.button,
    borderColor: theme.colors.onBackground,
  };

  const textStyles: TextStyle = {
    fontFamily: theme.fonts.default.fontFamily,
    fontWeight: '500',
  };

  return (
    <View style={styles.container}>
      <GoogleSocialButton
        onPress={onGooglePress}
        buttonViewStyle={buttonStyles}
        textStyle={textStyles}
      />
      {Platform.OS === 'ios' && (
        <AppleSocialButton
          onPress={onApplePress}
          buttonViewStyle={buttonStyles}
          textStyle={textStyles}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 12,
    gap: 16,
  },
  button: {
    width: '100%',
    height: 60,
    borderRadius: 8,
    borderWidth: 0.5,
  },
});
