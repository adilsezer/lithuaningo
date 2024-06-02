import React, { useState } from "react";
import { Button, View, Text, Alert } from "react-native";
import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";
import CustomButton from "./CustomButton";
import { useThemeStyles } from "@src/hooks/useThemeStyles";

// Function to calculate the display order based on level
const calculateDisplayOrder = (
  level: string,
  index: number,
  baseIndex: number
): number => {
  const levelOrder: { [key: string]: number } = {
    A1: 1,
    A2: 2,
    B1: 3,
    B2: 4,
    C1: 5,
    C2: 6,
  };
  return levelOrder[level] * 10000 + baseIndex + index; // Ensures A1 cards come first, ordered by their index within the level
};

// Sample extracted data from the Personal Lithuanian Deck.txt file
const learningCards = [
  // Fill-in-the-blank cards
  {
    question: "Man patinka, kai Adilas man rodo dėmesį.",
    translation: "I like when Adil shows me attention.",
    answer: "dėmesį",
    baseForm: "Dėmesys",
    image: "file-bm4V4RZa0gnMWxS2lXczr9a8.webp",
    audio: "",
    extraInfo: "",
    tags: "",
    type: "fill_in_the_blank",
    level: "B1",
  },
  {
    question: "Smagu dirbti, kai žinai, kad laukia atlygis.",
    translation: "It's nice to work when you know that a reward awaits.",
    answer: "atlygis",
    baseForm: "Atlygis",
    image: "file-vBny3Zxq5YjvmN0Gj8dLgHxR.webp",
    audio: "",
    extraInfo: "",
    tags: "",
    type: "fill_in_the_blank",
    level: "B1",
  },
  {
    question: "Man patinka papletkinti su Adilu apie mano drauges.",
    translation: "I like to gossip with Adil about my friends.",
    answer: "papletkinti",
    baseForm: "Pletkinti",
    image: "file-o3srBukCCDUPkxCtqdJYyC4y.webp",
    audio: "",
    extraInfo: "",
    tags: "",
    type: "fill_in_the_blank",
    level: "A2",
  },
  {
    question: "Kas šitame filme atliks pagrindinį vaidmenį?",
    translation: "Who in this movie will perform the main role?",
    answer: "vaidmenį",
    baseForm: "Vaidmuo",
    image: "file-tJrI1hdGTzJOyIy3oyg2J8ea.webp",
    audio: "",
    extraInfo: "",
    tags: "",
    type: "fill_in_the_blank",
    level: "A2",
  },
  {
    question:
      "Koks yra tikslus šito žodžio apibrėžimas? Nežinau, pažiūrėk žodyne.",
    translation:
      "What is the precise definition of this word? I don't know, look in the dictionary.",
    answer: "apibrėžimas",
    baseForm: "Apibrėžimas",
    image: "file-UZNh4dBnWEVQDz7xFORtv9gE.webp",
    audio: "",
    extraInfo: "",
    tags: "",
    type: "fill_in_the_blank",
    level: "B1",
  },
  {
    question: "Mes visi turime tiek trūkumų, tiek privalumų.",
    translation: "We all have both disadvantages and advantages.",
    answer: "trūkumų",
    baseForm: "Trūkumas",
    image: "file-KtrNq32KK4w7h9BhsPRuzI9t.webp",
    audio: "",
    extraInfo: "",
    tags: "",
    type: "fill_in_the_blank",
    level: "A2",
  },
  {
    question: "Mes visi esame vartotojai, nes gyvename kapitalizmo laikais.",
    translation: "We are all consumers because we live in times of capitalism.",
    answer: "vartotojai",
    baseForm: "Vartotojas",
    image: "file-fCsEjJfokOGQfdpVNSGgvzaI.webp",
    audio: "",
    extraInfo: "",
    tags: "",
    type: "fill_in_the_blank",
    level: "B1",
  },
  {
    question: "Nori vakarienei ryžių ar lęšių? Man tas pats, tu nuspręsk.",
    translation:
      "Do you want rice or lentils for dinner? I don't mind, you decide.",
    answer: "lęšių",
    baseForm: "Lęšiai",
    image: "file-4EPeiqOPZWRtKxM4jkJAm7Da.webp",
    audio: "",
    extraInfo: "",
    tags: "",
    type: "fill_in_the_blank",
    level: "A1",
  },
  // Multiple-choice cards
  {
    question:
      "In the sentence 'Mmmm, šita lova tokia minkšta ir šilta, nenoriu niekur eiti,' what does 'minkšta' mean in English?",
    translation:
      "Mmm, this bed is so soft and warm, I do not want to go anywhere.",
    answer: "Soft",
    baseForm: "Minkštas",
    image: "file-3GCVLaF9f5NmVzywDn8VBLYF.webp",
    audio: "",
    extraInfo: "",
    tags: "",
    options: ["Hard", "Soft", "Cold", "Warm"],
    type: "multiple_choice",
    level: "A1",
  },
  {
    question:
      "In the sentence 'Svarbu ne tik tikėti principais, bet ir taikyti juos savo gyvenime,' what does 'taikyti' mean in English?",
    translation:
      "It's important not only to believe in principles but also to apply them in one's life.",
    answer: "Apply",
    baseForm: "Taikyti",
    image: "file-CVFMiqgxCeaUcXdRfDsWMsgl.webp",
    audio: "",
    extraInfo: "",
    tags: "",
    options: ["Apply", "Ignore", "Forget", "Discuss"],
    type: "multiple_choice",
    level: "B2",
  },
  {
    question:
      "In the sentence 'Aš nenoriu seno, senoviško buto. Noriu kažko modernaus,' what does 'senoviško' mean in English?",
    translation:
      "I do not want an old, antique apartment. I want something modern.",
    answer: "Antique",
    baseForm: "Senoviškas",
    image: "file-4pDUH5LvQ9b7bAObgs5ZP5fe.webp",
    audio: "",
    extraInfo: "",
    tags: "",
    options: ["Modern", "Antique", "Cheap", "Large"],
    type: "multiple_choice",
    level: "A2",
  },
  {
    question:
      "In the sentence 'Norėčiau mesti darbą ir tapti muzikantu. Eik tu, nešnekėk nesąmonių,' what does 'nesąmonių' mean in English?",
    translation:
      "I would like to quit my job and become a musician. Come on, don't talk nonsense.",
    answer: "Nonsense",
    baseForm: "Nesąmonė",
    image: "file-DayiGcHdQmOVh1R7iwagRMrI.webp",
    audio: "",
    extraInfo: "",
    tags: "",
    options: ["Sense", "Truth", "Nonsense", "Stories"],
    type: "multiple_choice",
    level: "B1",
  },
  {
    question:
      "In the sentence 'Kai išgeri alkoholio, bendravimas pasidaro lengvesnis,' what does 'bendravimas' mean in English?",
    translation: "When you drink alcohol, communication becomes easier.",
    answer: "Communication",
    baseForm: "Bendravimas",
    image: "file-v6EKuO1NefamU2njzxwuYu1M.webp",
    audio: "",
    extraInfo: "",
    tags: "",
    options: ["Drinking", "Talking", "Communication", "Fighting"],
    type: "multiple_choice",
    level: "A2",
  },
  // Multiple-choice with true/false cards
  {
    question:
      "Aš bandau padaryti popkornų, bet man nepavyksta. Does 'nepavyksta' mean 'fail'?",
    translation: "I'm trying to make popcorn, but I fail.",
    answer: "True",
    baseForm: "Nepavykti",
    image: "file-sJdhGoioxhsdboxMkcqb6H31.webp",
    audio: "",
    extraInfo: "",
    tags: "",
    options: ["True", "False"],
    type: "multiple_choice",
    level: "B1",
  },
  {
    question:
      "In the sentence 'Taneris turi daug reikalavimų,' what does 'reikalavimų' mean in English?",
    translation: "Taner has many requirements.",
    answer: "Requirements",
    baseForm: "Reikalavimas",
    image: "file-zYwLbrGoVqQznpFGMUardOlK.webp",
    audio: "",
    extraInfo: "",
    tags: "",
    options: ["Problems", "Requests", "Requirements", "Complaints"],
    type: "multiple_choice",
    level: "B1",
  },
];

const fetchImageUrl = async (fileNameSubstring: string) => {
  try {
    const storageRef = storage().ref().child("learning_cards");
    const result = await storageRef.listAll();

    // Filter files containing either part
    const matchingFiles = result.items.filter((item) =>
      item.fullPath.includes(fileNameSubstring)
    );

    if (matchingFiles.length === 1) {
      const url = await matchingFiles[0].getDownloadURL();
      return url;
    } else if (matchingFiles.length > 1) {
      console.warn(
        `Multiple images found containing substring: ${fileNameSubstring}. Returning the first match.`
      );
      const url = await matchingFiles[0].getDownloadURL();
      return url;
    } else {
      console.warn(`No image found containing substring: ${fileNameSubstring}`);
      return ""; // Return an empty string if no matching image is found
    }
  } catch (error) {
    console.error(
      `Error fetching image URL for substring ${fileNameSubstring}: `,
      error
    );
    return ""; // Return an empty string if an error occurs
  }
};

const updateCardsWithImageUrls = async () => {
  const updatedCards = await Promise.all(
    learningCards.map(async (card) => {
      const imageUrl = await fetchImageUrl(card.image);
      return { ...card, image: imageUrl };
    })
  );
  return updatedCards;
};

const AddLearningCards = () => {
  const [isAdding, setIsAdding] = useState(false);
  const { styles: globalStyles } = useThemeStyles();

  const addCardsToFirestore = async () => {
    setIsAdding(true);

    try {
      const updatedCards = await updateCardsWithImageUrls();

      // Fetch current count of documents in the Firestore collection
      const learningCardsCollection = firestore().collection("learningCards");
      const snapshot = await learningCardsCollection.get();
      const baseIndex = snapshot.size;

      const batch = firestore().batch();

      updatedCards.forEach((card, index) => {
        const displayOrder = calculateDisplayOrder(
          card.level,
          index,
          baseIndex
        );
        const docRef = learningCardsCollection.doc(); // Automatically generate a unique ID
        batch.set(docRef, { ...card, displayOrder });
      });

      await batch.commit();
      setIsAdding(false);
      Alert.alert(
        "Success",
        "All learning cards have been added successfully!"
      );
    } catch (error) {
      setIsAdding(false);
      Alert.alert(
        "Error",
        "There was an error adding the cards. Please try again."
      );
      console.error("Error adding cards: ", error);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={globalStyles.subtitle}>
        Add All Learning Cards to Firestore at Once
      </Text>
      <CustomButton
        title={isAdding ? "Adding Cards..." : "Add All Cards"}
        onPress={addCardsToFirestore}
        disabled={isAdding}
      />
    </View>
  );
};

export default AddLearningCards;
