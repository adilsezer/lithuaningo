import React from "react";
import { View, StyleSheet, Text, Image, Pressable } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useThemeStyles } from "@hooks/useThemeStyles";
import CustomButton from "@components/ui/CustomButton";

interface ImageFile {
  uri: string;
  type: string;
  name: string;
}

interface CustomImagePickerProps {
  value: ImageFile | null;
  onChange: (file: ImageFile | null) => void;
  label: string;
  error?: string;
}

export const CustomImagePicker: React.FC<CustomImagePickerProps> = ({
  value,
  onChange,
  label,
  error,
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
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      onChange({
        uri: asset.uri,
        type: "image/jpeg",
        name: asset.uri.split("/").pop() || "image.jpg",
      });
    }
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
          <Image source={{ uri: value.uri }} style={styles.image} />
        ) : (
          <View
            style={[styles.placeholder, { backgroundColor: colors.border }]}
          >
            <Text style={[styles.placeholderText, { color: colors.text }]}>
              Tap to select image
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
  button: {
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});
