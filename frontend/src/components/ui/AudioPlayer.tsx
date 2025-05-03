import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, TouchableOpacity, Platform } from "react-native";
import { useTheme } from "react-native-paper";
import { Audio, AVPlaybackStatus } from "expo-av";
import Icon from "@expo/vector-icons/MaterialIcons";
import CustomText from "./CustomText";

interface AudioPlayerProps {
  audioUrl: string;
}

export default function AudioPlayer({ audioUrl }: AudioPlayerProps) {
  const theme = useTheme();
  const sound = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize and clean up audio
  useEffect(() => {
    let isMounted = true;

    // Initialize audio
    const initAudio = async () => {
      try {
        // Unload any existing sound
        if (sound.current) {
          await sound.current.unloadAsync();
          sound.current = null;
        }

        setIsLoaded(false);

        // Configure audio session - only needs to be done once
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          interruptionModeIOS: 1,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: 1,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: false,
        });

        if (!audioUrl) return;

        // Create and load the Sound object
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: false },
          _onPlaybackStatusUpdate
        );

        // Only update state if component is still mounted
        if (isMounted) {
          sound.current = newSound;
          setIsLoaded(true);
        } else {
          // Clean up if unmounted during load
          newSound.unloadAsync();
        }
      } catch (error) {
        console.error("Failed to load audio:", error);
        setIsLoaded(false);
      }
    };

    initAudio();

    // Cleanup function
    return () => {
      isMounted = false;
      if (sound.current) {
        sound.current.unloadAsync();
      }
    };
  }, [audioUrl]);

  // Status update callback
  const _onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      // Update state if there was an error during playback
      if (status.error) {
        console.error(
          `Encountered a fatal error during playback: ${status.error}`
        );
        setIsPlaying(false);
      }
      return;
    }

    // Update the UI based on the playback status
    setIsPlaying(status.isPlaying);

    if (status.didJustFinish) {
      // Audio playback finished
      setIsPlaying(false);
    }
  };

  // Handle play/pause button press
  const handleTogglePlayback = async () => {
    if (!sound.current || !isLoaded) return;

    try {
      const status = await sound.current.getStatusAsync();

      if (status.isLoaded) {
        if (status.isPlaying) {
          await sound.current.pauseAsync();
        } else {
          // If the sound has finished playing, restart from beginning
          if (status.positionMillis === status.durationMillis) {
            await sound.current.setPositionAsync(0);
          }

          await sound.current.playAsync();
        }
      }
    } catch (error) {
      console.error("Error toggling playback:", error);
    }
  };

  return (
    <View style={styles.audioContainer}>
      <TouchableOpacity
        style={[
          styles.audioButton,
          !isLoaded && styles.audioButtonDisabled,
          { backgroundColor: theme.colors.primary },
        ]}
        onPress={handleTogglePlayback}
        disabled={!isLoaded}
      >
        <Icon
          name={isPlaying ? "pause" : "play-arrow"}
          size={36}
          color={isLoaded ? theme.colors.onPrimary : theme.colors.outline}
        />
      </TouchableOpacity>
      <CustomText
        variant="bodyMedium"
        style={[styles.listenText, !isLoaded && styles.textDisabled]}
      >
        {isLoaded ? (isPlaying ? "Pause" : "Listen") : "Loading..."}
      </CustomText>
    </View>
  );
}

const styles = StyleSheet.create({
  audioContainer: {
    flexDirection: "column",
    alignItems: "center",
  },
  audioButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  audioButtonDisabled: {
    backgroundColor: "#f0f0f0",
    opacity: 0.7,
  },
  listenText: {
    textAlign: "center",
  },
  textDisabled: {
    opacity: 0.5,
  },
});
