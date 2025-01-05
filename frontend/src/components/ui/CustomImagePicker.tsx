import React from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  Pressable,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useThemeStyles } from "@hooks/useThemeStyles";
import CustomButton from "@components/ui/CustomButton";

interface ImageFile {
  uri: string;
  type: string;
  name: string;
}

interface CustomImagePickerProps {
  value: ImageFile | ImageFile[] | null;
  onChange: (file: ImageFile | ImageFile[] | null) => void;
  label: string;
  error?: string;
  maxSize?: number; // in bytes
  allowMultiple?: boolean;
}

export const CustomImagePicker: React.FC<CustomImagePickerProps> = ({
  value,
  onChange,
  label,
  error,
  maxSize,
  allowMultiple = false,
}) => {
  const { colors } = useThemeStyles();

  const handleImagePick = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: !allowMultiple,
      aspect: [4, 3],
      quality: 0.8,
      allowsMultipleSelection: allowMultiple,
    });

    if (!result.canceled) {
      const assets = result.assets;

      // Check size for all selected images
      if (maxSize) {
        const oversizedImages = assets.filter(
          (asset) => asset.fileSize && asset.fileSize > maxSize
        );
        if (oversizedImages.length > 0) {
          alert(
            `Image size must be less than ${(maxSize / (1024 * 1024)).toFixed(
              1
            )}MB`
          );
          return;
        }
      }

      if (allowMultiple) {
        const imageFiles = assets.map((asset) => ({
          uri: asset.uri,
          type: "image/jpeg",
          name: asset.uri.split("/").pop() || "image.jpg",
        }));
        onChange(imageFiles);
      } else {
        const asset = assets[0];
        onChange({
          uri: asset.uri,
          type: "image/jpeg",
          name: asset.uri.split("/").pop() || "image.jpg",
        });
      }
    }
  };

  const renderImages = () => {
    if (!value) return null;

    const images = Array.isArray(value) ? value : [value];

    return (
      <ScrollView
        horizontal
        style={styles.imageScroll}
        showsHorizontalScrollIndicator={false}
      >
        {images.map((img, index) => (
          <View key={index} style={styles.imageWrapper}>
            <Image source={{ uri: img.uri }} style={styles.image} />
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <Pressable
        style={[
          styles.imageContainer,
          { borderColor: error ? colors.error : colors.border },
        ]}
        onPress={handleImagePick}
      >
        {value ? (
          renderImages()
        ) : (
          <View
            style={[styles.placeholder, { backgroundColor: colors.border }]}
          >
            <Text style={[styles.placeholderText, { color: colors.text }]}>
              Tap to select {allowMultiple ? "images" : "image"}
            </Text>
          </View>
        )}
      </Pressable>
      <CustomButton
        title={value ? "Change Image" : "Select Image"}
        onPress={handleImagePick}
        style={styles.button}
      />
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
  imageContainer: {
    width: "100%",
    height: 200,
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
  },
  imageScroll: {
    flexGrow: 0,
  },
  imageWrapper: {
    width: 180,
    height: "100%",
    marginRight: 8,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 4,
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
  button: {
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});
