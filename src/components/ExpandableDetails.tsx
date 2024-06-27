import { useThemeStyles } from "@src/hooks/useThemeStyles";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

interface ExpandableDetailsProps {
  translation: string;
}

const ExpandableDetails: React.FC<ExpandableDetailsProps> = ({
  translation,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();

  const { width } = Dimensions.get("window");
  const isTablet = (Platform.OS === "ios" && Platform.isPad) || width >= 768;

  return (
    <View
      style={[
        styles.container,
        { borderColor: globalColors.border },
        isTablet && styles.containerIpad,
      ]}
    >
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        style={styles.summaryContainer}
      >
        <Icon
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={globalColors.secondary}
        />
        <Text style={[globalStyles.text, { marginLeft: 8 }]}>
          Click to see the English translation
        </Text>
      </TouchableOpacity>
      {isExpanded && <Text style={globalStyles.text}>{translation}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignSelf: "center",
  },
  containerIpad: {
    width: "75%", // Full width for iPad
  },
  summaryContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
  },
});

export default ExpandableDetails;
