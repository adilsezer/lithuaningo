import React from "react";
import { StyleSheet } from "react-native";
import { IconButton, useTheme } from "react-native-paper";
import { useAudio } from "@hooks/useAudio";

interface AudioControlProps {
  url: string;
  size?: number;
  style?: any;
  onPress?: (e: any) => void;
}

export const AudioControl: React.FC<AudioControlProps> = ({
  url,
  size = 28,
  style,
  onPress,
}) => {
  const { handlePlaySound, isPlaying } = useAudio();
  const theme = useTheme();

  const handlePress = (e: any) => {
    // Allow custom press handler if provided
    if (onPress) {
      onPress(e);
    }
    handlePlaySound(url);
  };

  return (
    <IconButton
      icon={isPlaying(url) ? "pause" : "volume-high"}
      size={size}
      onPress={handlePress}
      containerColor={theme.colors.primary}
      iconColor={theme.colors.onPrimary}
      style={[styles.audioButton, style]}
    />
  );
};

const styles = StyleSheet.create({
  audioButton: {
    alignSelf: "center",
    marginTop: 12,
  },
});

export default AudioControl;
