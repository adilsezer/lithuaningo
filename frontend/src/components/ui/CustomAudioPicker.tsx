import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, Pressable } from "react-native";
import { Audio, AVPlaybackStatus } from "expo-av";
import { FontAwesome } from "@expo/vector-icons";
import { useThemeStyles } from "@hooks/useThemeStyles";
import CustomButton from "@components/ui/CustomButton";

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

export const CustomAudioPicker: React.FC<CustomAudioPickerProps> = ({
  value,
  onChange,
  error,
}) => {
  const { colors } = useThemeStyles();
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
        <Text style={[styles.errorText, { color: colors.error }]}>
          No permission to record audio
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.audioContainer,
          { borderColor: error ? colors.error : colors.border },
        ]}
        onPress={value ? playSound : startRecording}
      >
        <View
          style={[styles.placeholder, { backgroundColor: colors.secondary }]}
        >
          <FontAwesome
            name={
              isRecording
                ? "stop-circle"
                : value
                ? isPlaying
                  ? "pause-circle"
                  : "play-circle"
                : "microphone"
            }
            size={40}
            color={isRecording ? colors.error : colors.text}
          />
          <Text style={[styles.placeholderText, { color: colors.text }]}>
            {isRecording
              ? "Recording... Tap to stop"
              : value
              ? isPlaying
                ? "Playing... Tap to pause"
                : "Tap to play"
              : "Tap to start recording"}
          </Text>
        </View>
      </Pressable>
      {value ? (
        <CustomButton
          title="Record New Audio"
          onPress={() => {
            if (sound) {
              sound.unloadAsync();
              setSound(null);
            }
            onChange(null);
          }}
          style={styles.button}
        />
      ) : isRecording ? (
        <CustomButton
          title="Stop Recording"
          onPress={stopRecording}
          style={styles.button}
        />
      ) : null}
      {error && (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  audioContainer: {
    width: "100%",
    height: 120,
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
  },
  placeholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  placeholderText: {
    fontSize: 16,
  },
  button: {
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});
