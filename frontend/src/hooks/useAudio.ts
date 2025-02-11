import { useState, useCallback, useEffect } from "react";
import { Audio } from "expo-av";
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

  // Request permissions on mount
  useEffect(() => {
    const getPermission = async () => {
      const permission = await Audio.requestPermissionsAsync();
      setPermissionResponse(permission);
    };
    getPermission();
  }, []);

  // Cleanup effect for playback
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const handleError = useCallback(
    (error: Error, message: string) => {
      console.error(message, error);
      showError(message);
      return null;
    },
    [showError]
  );

  const startRecording = useCallback(async () => {
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
    } catch (error) {
      handleError(error as Error, "Failed to start recording");
    }
  }, [handleError]);

  const stopRecording = useCallback(async () => {
    if (!recording) return null;

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
        return audioFile;
      }
      return null;
    } catch (error) {
      handleError(error as Error, "Failed to stop recording");
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
        });

        // If we're already playing this URL, stop it
        if (playingUrl === url && sound) {
          await sound.pauseAsync();
          setPlayingUrl(null);
          return;
        }

        // Always unload the previous sound before creating a new one
        if (sound) {
          try {
            await sound.pauseAsync();
            await sound.unloadAsync();
          } catch (error) {}
          setSound(null);
        }

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: url },
          { shouldPlay: true },
          async (status) => {
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

        setSound(newSound);
        setPlayingUrl(url);
      } catch (error) {
        handleError(error as Error, "Error playing audio");
        if (sound) {
          try {
            await sound.pauseAsync();
            await sound.unloadAsync();
          } catch (unloadError) {}
        }
        setSound(null);
        setPlayingUrl(null);
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
