import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { addCard, updateCard, Card } from '@src/services/FirebaseDataService';
import { useThemeStyles } from '@src/hooks/useThemeStyles';
import CustomButton from './CustomButton';

interface AdminCardFormProps {
  cardToEdit?: Card;
}

const AdminCardForm: React.FC<AdminCardFormProps> = ({ cardToEdit }) => {
  const [question, setQuestion] = useState(cardToEdit ? cardToEdit.question : '');
  const [answer, setAnswer] = useState(cardToEdit ? cardToEdit.answer : '');
  const [type, setType] = useState(cardToEdit ? cardToEdit.type : 'multiple_choice');
  const [options, setOptions] = useState(cardToEdit ? (cardToEdit.options?.join(', ') || '') : '');
  const { styles: globalStyles } = useThemeStyles();

  const handleSubmit = async () => {
    const card: Card = {
      question,
      answer,
      type,
      options: options.split(',').map(option => option.trim()),
    };

    try {
      if (cardToEdit) {
        // Update card
        const result = await updateCard(cardToEdit.id!, card);
        if (result.success) {
          Alert.alert('Success', 'Card updated successfully!');
        } else {
          throw new Error('Error when updating the card.');
        }
      } else {
        // Add new card
        const result = await addCard(card);
        if (result.success) {
          Alert.alert('Success', 'Card added successfully!');
        } else {
          throw new Error('Error when adding the card.');
        }
      }
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Question"
        value={question}
        onChangeText={setQuestion}
        style={globalStyles.input}      />
      <TextInput
        placeholder="Answer"
        value={answer}
        onChangeText={setAnswer}
        style={globalStyles.input}
      />
      <TextInput
        placeholder="Type"
        value={type}
        onChangeText={setType}
        style={globalStyles.input}
      />
      <TextInput
        placeholder="Options (comma separated)"
        value={options}
        onChangeText={setOptions}
        style={globalStyles.input}
      />
      <CustomButton title={cardToEdit ? 'Update Card' : 'Add Card'} onPress={handleSubmit} />
    </View>
  );
};

export default AdminCardForm;
