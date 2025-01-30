import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Audio, AVPlaybackStatus } from "expo-av";
import { IconButton, Button, Text, useTheme, Card } from "react-native-paper";

interface AudioFile {
  uri: string;
  type: string;
  name: string;
}

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
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [permissionResponse, setPermissionResponse] =
    useState<Audio.PermissionResponse>();

  useEffect(() => {
    const getPermission = async () => {
      const permission = await Audio.requestPermissionsAsync();
      setPermissionResponse(permission);
    };
    getPermission();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);

      if (uri) {
        const audioFile: AudioFile = {
          uri,
          type: "audio/m4a",
          name: `recording-${Date.now()}.m4a`,
        };
        onChange(audioFile);
      }
    } catch (err) {
      console.error("Failed to stop recording", err);
    }
  };

  const playSound = async () => {
    if (!value?.uri) return;

    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: value.uri },
          { shouldPlay: true }
        );
        setSound(newSound);
        setIsPlaying(true);

        newSound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
          if (!status.isLoaded) return;

          if (!status.isPlaying && status.didJustFinish) {
            setIsPlaying(false);
          } else if (!status.isPlaying) {
            setIsPlaying(false);
          }
        });
      }
    } catch (err) {
      console.error("Failed to play sound", err);
    }
  };

  if (!permissionResponse?.granted) {
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
      <Card mode="outlined" style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <IconButton
            icon={
              isRecording
                ? "stop"
                : value
                ? isPlaying
                  ? "pause"
                  : "play"
                : "microphone"
            }
            size={48}
            onPress={
              isRecording ? stopRecording : value ? playSound : startRecording
            }
            iconColor={isRecording ? theme.colors.error : theme.colors.primary}
          />
          <Text style={styles.statusText}>
            {isRecording
              ? "Recording... Tap to stop"
              : value
              ? isPlaying
                ? "Playing... Tap to pause"
                : "Tap to play"
              : "Tap to start recording"}
          </Text>
        </Card.Content>
      </Card>
      {value && (
        <Button
          mode="contained-tonal"
          onPress={() => {
            if (sound) {
              sound.unloadAsync();
              setSound(null);
            }
            onChange(null);
          }}
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
    padding: 16,
  },
  card: {
    marginBottom: 16,
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
