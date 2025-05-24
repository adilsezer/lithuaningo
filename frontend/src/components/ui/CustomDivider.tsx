import { ReactNode } from 'react';
import { View } from 'react-native';
import { Divider as PaperDivider, Text } from 'react-native-paper';

interface CustomDividerProps {
  content?: ReactNode;
}

export default function CustomDivider({ content }: CustomDividerProps) {
  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}
    >
      <PaperDivider style={{ flex: 1 }} />
      {content && <Text style={{ marginHorizontal: 10 }}>{content}</Text>}
      <PaperDivider style={{ flex: 1 }} />
    </View>
  );
}
