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
  FirebaseDataService,
  LearningCard,
} from "../services/FirebaseDataService";
import { useThemeStyles } from "@src/hooks/useThemeStyles";
import CustomButton from "./CustomButton";
import Dropdown from "./Dropdown";
import * as ImagePicker from "expo-image-picker";
import storage from "@react-native-firebase/storage";
import { useAppSelector } from "../redux/hooks";
import { selectUserData } from "../redux/slices/userSlice";
import { clearData } from "@src/utils/storageUtil";

const AdminCardForm: React.FC = () => {
  const userData = useAppSelector(selectUserData);
  const [cards, setCards] = useState<LearningCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [type, setType] = useState<"multiple_choice" | "fill_in_the_blank">(
    "multiple_choice"
  );
  const [options, setOptions] = useState("");
  const [image, setImage] = useState<string | undefined>(undefined);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [baseForm, setBaseForm] = useState<string>("");
  const [baseFormTranslation, setBaseFormTranslation] = useState<string>("");
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [translation, setTranslation] = useState<string>("");
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();

  useEffect(() => {
    if (userData && userData.id) {
      const loadCards = async () => {
        const learningCards = await FirebaseDataService.fetchLearningCards(
          userData.id
        );
        setCards(learningCards);
      };
      loadCards();
    }
  }, [userData]);

  useEffect(() => {
    if (selectedCardId && selectedCardId !== "") {
      const card = cards.find((c) => c.id === selectedCardId);
      if (card) {
        setQuestion(card.question);
        setAnswer(card.answer);
        setType(card.type as "multiple_choice" | "fill_in_the_blank");
        setOptions(card.options?.join(", ") || "");
        setImage(card.image || undefined);
        setUploadProgress("");
        setBaseForm(card.baseForm);
        setBaseFormTranslation(card.baseFormTranslation);
        setDisplayOrder(card.displayOrder);
        setTranslation(card.translation);
      }
    } else {
      setQuestion("");
      setAnswer("");
      setType("multiple_choice");
      setOptions("");
      setImage(undefined);
      setUploadProgress("");
      setBaseForm("");
      setBaseFormTranslation("");
      setDisplayOrder(0);
      setTranslation("");
    }
  }, [selectedCardId, cards]);

  const handleSubmit = async () => {
    const card: Partial<LearningCard> = {
      question,
      answer,
      type,
      options: options.split(",").map((option) => option.trim()),
      image,
      baseForm,
      baseFormTranslation,
      displayOrder,
      translation,
    };

    try {
      if (selectedCardId && selectedCardId !== "") {
        const result = await FirebaseDataService.updateCard(
          selectedCardId,
          card as LearningCard
        );
        if (result.success) {
          Alert.alert("Success", "Card updated successfully!");
        } else {
          throw new Error("Error when updating the card.");
        }
      } else {
        const result = await FirebaseDataService.addCard(card as LearningCard);
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
      const result = await FirebaseDataService.deleteCard(selectedCardId);
      if (result.success) {
        Alert.alert("Success", "Card deleted successfully!");
        setSelectedCardId("");
      } else {
        throw new Error("Error when deleting the card.");
      }
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    }
  };

  const handleDeleteStorage = async () => {
    try {
      if (userData && userData.id) {
        await clearData(`dailyCards_${userData.id}`);
      }
      // You can add more logic here if needed
    } catch (error) {
      console.error("Error clearing data:", error);
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
      const filename = uri.split("/").pop();
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
      return downloadUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  return (
    <ScrollView>
      <Text style={globalStyles.subtitle}>Card List</Text>

      <Dropdown
        onValueChange={(value) => setSelectedCardId(value)}
        placeholder={{ label: "Add New Card", value: "" }}
        options={cards.map((card) => ({
          label: card.question,
          value: card.id || "",
        }))}
        value={selectedCardId}
      />
      <Text style={globalStyles.subtitle}>Type</Text>

      <Dropdown
        onValueChange={(value) =>
          setType(value as "multiple_choice" | "fill_in_the_blank")
        }
        placeholder={{ label: "Select the card type", value: "" }}
        options={[
          { label: "Multiple Choice", value: "multiple_choice" },
          { label: "Fill in the Blank", value: "fill_in_the_blank" },
        ]}
        value={type}
      />
      <Text style={globalStyles.subtitle}>Question</Text>
      <TextInput
        placeholder="Question"
        value={question}
        onChangeText={setQuestion}
        style={globalStyles.input}
      />
      <Text style={globalStyles.subtitle}>Answer</Text>
      <TextInput
        placeholder="Answer"
        value={answer}
        onChangeText={setAnswer}
        style={globalStyles.input}
      />
      {type === "multiple_choice" && (
        <>
          <Text style={globalStyles.subtitle}>Options (comma separated)</Text>
          <TextInput
            placeholder="Options (comma separated)"
            value={options}
            onChangeText={setOptions}
            style={globalStyles.input}
          />
        </>
      )}
      <Text style={globalStyles.subtitle}>Base Form</Text>
      <TextInput
        placeholder="Base Form"
        value={baseForm}
        onChangeText={setBaseForm}
        style={globalStyles.input}
      />
      <Text style={globalStyles.subtitle}>Base Form Translation</Text>
      <TextInput
        placeholder="Base Form Translation"
        value={baseFormTranslation}
        onChangeText={setBaseFormTranslation}
        style={globalStyles.input}
      />
      <Text style={globalStyles.subtitle}>Display Order</Text>
      <TextInput
        placeholder="Display Order"
        value={String(displayOrder)}
        onChangeText={(text) => setDisplayOrder(Number(text))}
        keyboardType="numeric"
        style={globalStyles.input}
      />
      <Text style={globalStyles.subtitle}>Translation</Text>
      <TextInput
        placeholder="Translation"
        value={translation}
        onChangeText={setTranslation}
        style={globalStyles.input}
      />
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
      <CustomButton title="Delete Storage" onPress={handleDeleteStorage} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 200,
    height: 200,
    marginVertical: 10,
    borderRadius: 10,
    alignSelf: "center",
  },
});

export default AdminCardForm;
