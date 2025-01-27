import React from "react";
import { View, StyleSheet, Text, Image, Pressable } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "react-native-paper";
import CustomText from "@components/typography/CustomText";
type ImageFile = {
  uri: string;
  type: string;
  name: string;
};

type CustomImagePickerProps = {
  value: ImageFile | null;
  onChange: (file: ImageFile | null) => void;
  error?: string;
  maxSize?: number;
};

export const CustomImagePicker: React.FC<CustomImagePickerProps> = ({
  value,
  onChange,
  error,
  maxSize,
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
      });
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.imageContainer,
          { borderColor: error ? theme.colors.error : theme.colors.primary },
        ]}
        onPress={handleImagePick}
      >
        {value ? (
          <Image source={{ uri: value.uri }} style={styles.image} />
        ) : (
          <View
            style={[
              styles.placeholder,
              { backgroundColor: theme.colors.primaryContainer },
            ]}
          >
            <CustomText
              style={[
                styles.placeholderText,
                { color: theme.colors.onBackground },
              ]}
            >
              Tap to select image
            </CustomText>
          </View>
        )}
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
    marginBottom: 16,
  },
  imageContainer: {
    width: "100%",
    height: 200,
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});
