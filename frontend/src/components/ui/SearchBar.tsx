import React, { useEffect, useRef } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { Searchbar, useTheme } from "react-native-paper";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  initialValue?: string;
  debounceTime?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Search...",
  style,
  initialValue = "",
  debounceTime = 1500,
}) => {
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

  const theme = useTheme();

  return (
    <Searchbar
      placeholder={placeholder}
      onChangeText={handleChangeText}
      value={value}
      style={[
        style,
        {
          backgroundColor: theme.colors.surface,
          marginVertical: 12,
          borderWidth: 1,
          borderColor: theme.colors.primary,
        },
      ]}
      inputStyle={{ color: theme.colors.onSurface }}
      placeholderTextColor={theme.colors.onSurfaceVariant}
    />
  );
};

export default SearchBar;
