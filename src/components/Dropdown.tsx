import React from "react";
import { View, Text } from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { useThemeStyles } from "@src/hooks/useThemeStyles";

interface DropdownProps {
  options: { label: string; value: string }[];
  placeholder?: { label: string; value: string };
  label?: string;
  onValueChange?: (value: string) => void;
  value?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  placeholder,
  label,
  onValueChange,
  value,
}) => {
  const handleValueChange = (value: string) => {
    console.log("Dropdown value changed to:", value);
    if (onValueChange) {
      onValueChange(value);
    }
  };

  const { styles: globalStyles } = useThemeStyles();

  return (
    <View style={globalStyles.input}>
      {label && <Text>{label}</Text>}
      <RNPickerSelect
        placeholder={placeholder || { label: "Select an option...", value: "" }}
        items={options}
        onValueChange={handleValueChange}
        value={value}
      />
    </View>
  );
};

export default Dropdown;
