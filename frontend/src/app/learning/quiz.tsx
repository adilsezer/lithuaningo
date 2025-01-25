import React, { useRef } from "react";
import { View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import BackButton from "@components/layout/BackButton";
import { SectionText } from "@components/typography";

const QuizScreen: React.FC = () => {
  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView ref={scrollViewRef}>
        <View style={{ flex: 1 }}>
          <BackButton />
          <SectionText>Quiz (To be implemented)</SectionText>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default QuizScreen;
