import React from "react";
import { View, StyleSheet } from "react-native";
import { IconButton, Button, Text, useTheme, Card } from "react-native-paper";
import { useAudio, AudioFile } from "@hooks/useAudio";

interface CustomAudioPickerProps {
  value: AudioFile | null;
  onChange: (file: AudioFile | null) => void;
  error?: string;
  placeholderText?: string;
}

export default function CustomAudioPicker({
  value,
  onChange,
  error,
  placeholderText = "Tap to start recording",
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
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: error ? theme.colors.error : theme.colors.primary,
          },
        ]}
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
              : placeholderText}
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
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
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
  card: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  cardContent: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  statusText: {
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
  },
  errorText: {
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
  actionButton: {
    marginTop: 8,
  },
});
