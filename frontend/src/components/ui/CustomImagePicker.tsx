import React, { useState } from "react";
import { View, StyleSheet, Text, Image, Pressable } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { IconButton, useTheme } from "react-native-paper";
import CustomText from "@components/ui/CustomText";
import type { ImageFile } from "@src/types";

type CustomImagePickerProps = {
  value: ImageFile | null;
  onChange: (file: ImageFile | null) => void;
  error?: string;
  maxSize?: number;
  placeholderText?: string;
};

export const CustomImagePicker: React.FC<CustomImagePickerProps> = ({
  value,
  onChange,
  error,
  maxSize,
  placeholderText = "Tap to select image",
}) => {
  const theme = useTheme();

  const handleImagePick = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!granted) {
      alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];

      if (maxSize && asset.fileSize && asset.fileSize > maxSize) {
        alert(
          `Image size must be less than ${(maxSize / (1024 * 1024)).toFixed(
            1
          )}MB`
        );
        return;
      }

      onChange({
        uri: asset.uri,
        type: "image/jpeg",
        name: asset.uri.split("/").pop() || "image.jpg",
        size: asset.fileSize || 0,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.card,
          { borderColor: error ? theme.colors.error : theme.colors.primary },
        ]}
        onPress={handleImagePick}
      >
        <View style={styles.cardWrapper}>
          {value ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: value.uri }} style={styles.content} />
              <View
                style={[
                  styles.overlay,
                  {
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                  },
                ]}
              >
                <IconButton
                  icon="camera"
                  size={32}
                  iconColor={theme.colors.surface}
                  style={styles.overlayIcon}
                />
                <CustomText
                  style={[styles.overlayText, { color: theme.colors.surface }]}
                >
                  {placeholderText}
                </CustomText>
              </View>
            </View>
          ) : (
            <View
              style={[
                styles.cardContent,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <IconButton
                icon="image"
                size={48}
                iconColor={theme.colors.primary}
              />
              <CustomText
                style={[
                  styles.statusText,
                  { color: theme.colors.onBackground },
                ]}
              >
                {placeholderText}
              </CustomText>
            </View>
          )}
        </View>
      </Pressable>
      {error && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 16,
  },
  card: {
    width: "100%",
    height: 200,
    borderWidth: 1,
    borderRadius: 8,
  },
  cardWrapper: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
    borderRadius: 8,
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  cardContent: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  content: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  overlayIcon: {
    margin: 0,
    marginBottom: 8,
  },
  overlayText: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
    paddingHorizontal: 16,
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
});
