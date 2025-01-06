import React, { useEffect, useRef } from "react";
import { TextInput, StyleSheet, ViewStyle, View } from "react-native";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { Ionicons } from "@expo/vector-icons";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  style?: ViewStyle;
  initialValue?: string;
  debounceTime?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Search decks...",
  style,
  initialValue = "",
  debounceTime = 300,
}) => {
  const { colors } = useThemeStyles();
  const [value, setValue] = React.useState(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (initialValue !== value) {
      setValue(initialValue);
    }
  }, [initialValue]);

  const handleChangeText = (text: string) => {
    setValue(text);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onSearch(text);
    }, debounceTime);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <View style={[styles.container, style, { backgroundColor: colors.card }]}>
      <Ionicons name="search" size={20} color={colors.text} />
      <TextInput
        style={[styles.input, { color: colors.text }]}
        value={value}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
});
