// styles/textStyles.ts
import { StyleSheet, Dimensions, Platform, TextStyle } from "react-native";
import { ThemeColors } from "./colors";

const { width } = Dimensions.get("window");

const isTablet = (Platform.OS === "ios" && Platform.isPad) || width >= 768;

export const createTextStyles = (colors: ThemeColors) => {
  const baseText: TextStyle = {
    color: colors.text,
    marginVertical: isTablet ? 10 : 5,
    textAlign: "center" as TextStyle["textAlign"],
    fontSize: isTablet ? 24 : 14,
  };

  const boldText: TextStyle = {
    ...baseText,
    fontFamily: "Roboto-Bold",
  };

  const italicText: TextStyle = {
    ...baseText,
    fontFamily: "Roboto-Italic",
  };

  const regularText: TextStyle = {
    ...baseText,
    fontFamily: "Roboto",
  };

  const contrastBaseText: TextStyle = {
    ...regularText,
    color: colors.cardText, // new text style with a different color
  };

  const contrastBoldText: TextStyle = {
    ...boldText,
    color: colors.cardText,
  };

  return StyleSheet.create({
    paragraph: {
      ...regularText,
      marginVertical: isTablet ? 15 : 10,
      lineHeight: isTablet ? 24 : 20,
      textAlign: "left" as TextStyle["textAlign"], // assuming paragraphs are left-aligned
    },
    contrastParagraph: {
      ...contrastBaseText,
      marginVertical: isTablet ? 15 : 10,
      lineHeight: isTablet ? 24 : 20,
      textAlign: "left" as TextStyle["textAlign"], // assuming paragraphs are left-aligned
    },
    title: {
      ...boldText,
      fontSize: isTablet ? 32 : 24,
      marginVertical: isTablet ? 15 : 10,
    },
    contrastTitle: {
      ...contrastBoldText,
      fontSize: isTablet ? 32 : 24,
      marginVertical: isTablet ? 15 : 10,
    },
    subtitle: {
      ...regularText,
      fontSize: isTablet ? 24 : 18,
      marginVertical: isTablet ? 15 : 10,
    },
    contrastSubtitle: {
      ...contrastBaseText,
      fontSize: isTablet ? 24 : 18,
      marginVertical: isTablet ? 15 : 10,
    },
    subheading: {
      ...boldText,
      fontSize: isTablet ? 24 : 18,
    },
    text: {
      ...regularText,
    },
    contrastText: {
      ...contrastBaseText,
    },
    buttonText: {
      ...boldText,
      fontSize: isTablet ? 24 : 14,
      color: colors.buttonText,
    },
    contrastButtonText: {
      ...contrastBoldText,
      fontSize: isTablet ? 24 : 14,
    },
    tabText: {
      ...regularText,
      fontSize: isTablet ? 20 : 16,
    },
    contrastTabText: {
      ...contrastBaseText,
      fontSize: isTablet ? 20 : 16,
    },
    activeTabText: {
      ...boldText,
    },
    contrastActiveTabText: {
      ...contrastBoldText,
    },
    bold: {
      ...boldText,
    },
    italic: {
      ...italicText,
    },
    contrastBold: {
      ...contrastBoldText,
    },
    instruction: {
      ...regularText,
      color: colors.lightText,
      marginTop: 5,
      marginBottom: 10,
    },
    contrastInstruction: {
      ...contrastBaseText,
      color: colors.lightText,
      marginTop: 5,
      marginBottom: 10,
    },
  });
};
