import React from "react";
import { View, StyleSheet } from "react-native";
import { IconButton, Button, Text, useTheme, Card } from "react-native-paper";
import { useAudio, AudioFile } from "@hooks/useAudio";

interface CustomAudioPickerProps {
  value: AudioFile | null;
  onChange: (file: AudioFile | null) => void;
  error?: string;
}

export default function CustomAudioPicker({
  value,
  onChange,
  error,
}: CustomAudioPickerProps) {
  const theme = useTheme();
  const {
    handlePlaySound,
    isPlaying,
    isRecording,
    hasPermission,
    startRecording,
    stopRecording,
  } = useAudio();

  const handleStopRecording = async () => {
    const audioFile = await stopRecording();
    if (audioFile) {
      onChange(audioFile);
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={{ color: theme.colors.error, textAlign: "center" }}>
          No permission to record audio
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card
        mode="outlined"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.primary,
        }}
      >
        <Card.Content style={styles.cardContent}>
          <IconButton
            icon={
              isRecording
                ? "stop"
                : value
                ? isPlaying(value.uri)
                  ? "pause"
                  : "play"
                : "microphone"
            }
            size={48}
            onPress={
              isRecording
                ? handleStopRecording
                : value
                ? () => handlePlaySound(value.uri)
                : startRecording
            }
            iconColor={isRecording ? theme.colors.error : theme.colors.primary}
          />
          <Text style={styles.statusText}>
            {isRecording
              ? "Recording... Tap to stop"
              : value
              ? isPlaying(value.uri)
                ? "Playing... Tap to pause"
                : "Tap to play"
              : "Tap to start recording"}
          </Text>
        </Card.Content>
      </Card>
      {value && (
        <Button
          mode="contained-tonal"
          onPress={() => onChange(null)}
          style={styles.actionButton}
        >
          Record New Audio
        </Button>
      )}
      {error && (
        <Text
          style={{
            color: theme.colors.error,
            marginTop: 8,
            textAlign: "center",
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 16,
  },
  cardContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 16,
  },
  actionButton: {
    marginTop: 8,
  },
});
