import React, { useState, useEffect } from "react";
import {
  TextInput,
  Alert,
  StyleSheet,
  Image,
  ScrollView,
  Text,
} from "react-native";
import {
  addCard,
  updateCard,
  deleteCard,
  Card,
  fetchLearningCards,
} from "@src/services/FirebaseDataService";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import CustomButton from "./CustomButton";
import Dropdown from "./Dropdown";
import * as ImagePicker from "expo-image-picker";
import storage from "@react-native-firebase/storage";

const AdminCardForm: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [type, setType] = useState("multiple_choice");
  const [options, setOptions] = useState("");
  const [image, setImage] = useState<string | undefined>(undefined);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();

  useEffect(() => {
    const unsubscribe = fetchLearningCards((learningCards) => {
      const cardList: Card[] = learningCards.map((card) => ({
        id: card.id,
        question: card.question,
        answer: card.answer,
        type: card.type,
        options: card.options,
        image: card.image,
      }));
      setCards(cardList);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedCardId && selectedCardId !== "") {
      const card = cards.find((c) => c.id === selectedCardId);
      if (card) {
        console.log("Setting form fields with selected card details", card);
        setQuestion(card.question);
        setAnswer(card.answer);
        setType(card.type);
        setOptions(card.options?.join(", ") || "");
        setImage(card.image || undefined);
        setUploadProgress("");
      }
    } else {
      console.log("Resetting form fields for new card");
      setQuestion("");
      setAnswer("");
      setType("");
      setOptions("");
      setImage(undefined);
      setUploadProgress("");
    }
  }, [selectedCardId, cards]);

  const handleSubmit = async () => {
    const card: Card = {
      question,
      answer,
      type,
      options: options.split(",").map((option) => option.trim()),
      image,
    };

    try {
      if (selectedCardId && selectedCardId !== "") {
        // Update card
        const result = await updateCard(selectedCardId, card);
        if (result.success) {
          Alert.alert("Success", "Card updated successfully!");
        } else {
          throw new Error("Error when updating the card.");
        }
      } else {
        // Add new card
        const result = await addCard(card);
        if (result.success) {
          Alert.alert("Success", "Card added successfully!");
        } else {
          throw new Error("Error when adding the card.");
        }
      }
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    }
  };

  const handleDelete = async () => {
    if (!selectedCardId) return;

    try {
      const result = await deleteCard(selectedCardId);
      if (result.success) {
        Alert.alert("Success", "Card deleted successfully!");
        setSelectedCardId(""); // Reset the form
      } else {
        throw new Error("Error when deleting the card.");
      }
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    }
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission to access media library is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      try {
        const uploadUrl = await uploadImageAsync(uri);
        setImage(uploadUrl);
      } catch (error) {
        Alert.alert("Error uploading image:", (error as Error).message);
      }
    }
  };

  const uploadImageAsync = async (uri: string) => {
    try {
      const filename = uri.split("/").pop(); // Extract the file name from the uri
      const reference = storage().ref(filename);
      const task = reference.putFile(uri);

      task.on("state_changed", (taskSnapshot) => {
        const percent = (
          (taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) *
          100
        ).toFixed(2);
        setUploadProgress(`Upload is ${percent}% complete`);
      });

      await task;

      const downloadUrl = await reference.getDownloadURL();
      console.log("Image uploaded to the bucket!", downloadUrl);

      return downloadUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  return (
    <ScrollView>
      <Dropdown
        onValueChange={(value) => {
          console.log("Selected Card ID:", value);
          setSelectedCardId(value);
        }}
        placeholder={{ label: "Add New Card", value: "" }}
        options={[
          ...cards.map((card) => ({
            label: card.question,
            value: card.id || "",
          })),
        ]}
        value={selectedCardId}
      />
      <Dropdown
        onValueChange={(value) => {
          console.log("Selected Card Type:", value);
          setType(value as string);
        }}
        placeholder={{ label: "Select the card type", value: "" }}
        options={[
          { label: "Multiple Choice", value: "multiple_choice" },
          { label: "Fill in the Blank", value: "fill_in_the_blank" },
        ]}
        value={type}
      />
      <TextInput
        placeholder="Question"
        value={question}
        onChangeText={setQuestion}
        style={globalStyles.input}
      />
      <TextInput
        placeholder="Answer"
        value={answer}
        onChangeText={setAnswer}
        style={globalStyles.input}
      />
      {type === "multiple_choice" && (
        <TextInput
          placeholder="Options (comma separated)"
          value={options}
          onChangeText={setOptions}
          style={globalStyles.input}
        />
      )}
      {image && <Image source={{ uri: image }} style={styles.image} />}
      <Text style={{ alignSelf: "center" }}>{uploadProgress}</Text>
      <CustomButton title="Pick an image" onPress={pickImage} />
      <CustomButton
        title={selectedCardId ? "Update Card" : "Add Card"}
        onPress={handleSubmit}
      />
      {selectedCardId && (
        <CustomButton
          title="Delete Card"
          onPress={handleDelete}
          style={{ backgroundColor: globalColors.error }}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  inputIOS: {
    fontSize: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "green",
    borderRadius: 8,
    color: "black",
    paddingRight: 30,
  },
  inputAndroid: {
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "blue",
    borderRadius: 8,
    color: "black",
    paddingRight: 30,
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 10,
    borderRadius: 10,
    alignSelf: "center",
  },
});

export default AdminCardForm;
