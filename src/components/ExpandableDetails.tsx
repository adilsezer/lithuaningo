import { useThemeStyles } from "@src/hooks/useThemeStyles";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

interface ExpandableDetailsProps {
  translation: string;
}

const ExpandableDetails: React.FC<ExpandableDetailsProps> = ({
  translation,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { styles: globalStyles, colors: globalColors } = useThemeStyles();

  return (
    <View style={[styles.container, { borderColor: globalColors.border }]}>
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
          Click to see the translation
        </Text>
      </TouchableOpacity>
      {isExpanded && <Text style={globalStyles.text}>{translation}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 15,
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
  },
  summaryContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default ExpandableDetails;
