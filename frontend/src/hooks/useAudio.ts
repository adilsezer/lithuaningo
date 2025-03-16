import { useState, useCallback, useEffect, useRef } from "react";
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";
import { useAlertDialog } from "@hooks/useAlertDialog";

export interface AudioFile {
  uri: string;
  type: string;
  name: string;
}

export const useAudio = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [permissionResponse, setPermissionResponse] =
    useState<Audio.PermissionResponse>();
  const { showError } = useAlertDialog();

  // Use a ref to track if the component is mounted
  const isMounted = useRef(true);

  // Request permissions on mount
  useEffect(() => {
    const getPermission = async () => {
      try {
        const permission = await Audio.requestPermissionsAsync();
        if (isMounted.current) {
          setPermissionResponse(permission);
        }
      } catch (error) {
        console.error("Error requesting audio permissions:", error);
      }
    };
    getPermission();

    // Set isMounted to false when component unmounts
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Cleanup effect for playback
  useEffect(() => {
    return () => {
      if (sound) {
        // Ensure we unload the sound when component unmounts
        (async () => {
          try {
            await sound.stopAsync();
            await sound.unloadAsync();
          } catch (error) {
            // Silently handle errors during cleanup
          }
        })();
      }

      // Also ensure we stop any ongoing recording
      if (recording) {
        (async () => {
          try {
            await recording.stopAndUnloadAsync();
          } catch (error) {
            // Silently handle errors during cleanup
          }
        })();
      }
    };
  }, [sound, recording]);

  const handleError = useCallback(
    (error: Error, message: string) => {
      console.error(message, error);
      if (isMounted.current) {
        showError(message);
      }
      return null;
    },
    [showError]
  );

  const startRecording = useCallback(async () => {
    try {
      // First, ensure any existing recording is stopped
      if (recording) {
        try {
          await recording.stopAndUnloadAsync();
        } catch (error) {}
        setRecording(null);
      }

      // Also ensure any playing sound is stopped
      if (sound) {
        try {
          await sound.stopAsync();
          await sound.unloadAsync();
        } catch (error) {}
        setSound(null);
        setPlayingUrl(null);
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        // Prevent audio interruption
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        shouldDuckAndroid: true,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      if (isMounted.current) {
        setRecording(newRecording);
        setIsRecording(true);
      } else {
        // If component unmounted during async operation, clean up
        try {
          await newRecording.stopAndUnloadAsync();
        } catch (error) {}
      }
    } catch (error) {
      handleError(error as Error, "Failed to start recording");
    }
  }, [handleError, recording, sound]);

  const stopRecording = useCallback(async () => {
    if (!recording) return null;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (isMounted.current) {
        setRecording(null);
        setIsRecording(false);
      }

      if (uri) {
        const audioFile: AudioFile = {
          uri,
          type: "audio/m4a",
          name: `recording-${Date.now()}.m4a`,
        };
        return audioFile;
      }
      return null;
    } catch (error) {
      handleError(error as Error, "Failed to stop recording");
      if (isMounted.current) {
        setRecording(null);
        setIsRecording(false);
      }
      return null;
    }
  }, [recording, handleError]);

  const handlePlaySound = useCallback(
    async (url: string) => {
      try {
        // First, set up the audio mode
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          // Set interruption mode to mix with other audio
          interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
          interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        });

        // If we're already playing this URL, stop it
        if (playingUrl === url && sound) {
          await sound.pauseAsync();
          if (isMounted.current) {
            setPlayingUrl(null);
          }
          return;
        }

        // Always unload the previous sound before creating a new one
        if (sound) {
          try {
            await sound.pauseAsync();
            await sound.unloadAsync();
          } catch (error) {}
          if (isMounted.current) {
            setSound(null);
          }
        }

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: url },
          { shouldPlay: true },
          async (status) => {
            if (!isMounted.current) return;

            if (!status.isLoaded) {
              if (status.error) {
                setPlayingUrl(null);
                if (sound) {
                  try {
                    await sound.unloadAsync();
                  } catch (error) {}
                }
                setSound(null);
                return;
              }
            }

            // Handle playback finished
            if (status.isLoaded && status.didJustFinish) {
              setPlayingUrl(null);
            }
          },
          true
        );

        if (isMounted.current) {
          setSound(newSound);
          setPlayingUrl(url);
        } else {
          // If component unmounted during async operation, clean up
          try {
            await newSound.stopAsync();
            await newSound.unloadAsync();
          } catch (error) {}
        }
      } catch (error) {
        handleError(error as Error, "Error playing audio");
        if (sound && isMounted.current) {
          try {
            await sound.pauseAsync();
            await sound.unloadAsync();
          } catch (unloadError) {}
          setSound(null);
          setPlayingUrl(null);
        }
      }
    },
    [sound, playingUrl, handleError]
  );

  return {
    // Playback
    isPlaying: (url: string) => playingUrl === url,
    handlePlaySound,

    // Recording
    isRecording,
    hasPermission: permissionResponse?.granted ?? false,
    startRecording,
    stopRecording,
  };
};
