import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  buttonContainer: {
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 10,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
  },
  textContainer: {
    width: "100%",
    alignItems: "center",
  },
});
