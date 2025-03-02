import React, { useState, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useUserData } from "@stores/useUserStore";
import { useDeckReport } from "@src/hooks/useDeckReport";
import { Form } from "@components/form/Form";
import { FormField } from "@components/form/form.types";
import { ErrorMessage } from "@components/ui/ErrorMessage";
import { reportFormSchema } from "@utils/zodSchemas";
import { useTheme } from "react-native-paper";
import CustomText from "@components/ui/CustomText";
import HeaderWithBackButton from "@components/layout/HeaderWithBackButton";

export default function ReportScreen() {
  const { id } = useLocalSearchParams();
  const theme = useTheme();
  const userData = useUserData();
  const { isLoading, error, submitReport, clearError } = useDeckReport();
  const [isSuccess, setIsSuccess] = useState(false);

  const navigateToDecks = useCallback(() => {
    router.push("/dashboard/decks");
  }, [router]);

  const handleSubmitReport = async (data: {
    reason: string;
    details: string;
  }) => {
    if (!userData?.id || !id) return;

    await submitReport({
      deckId: id as string,
      userId: userData.id,
      reason: data.reason,
      details: data.details,
    });

    setIsSuccess(true);
    setTimeout(navigateToDecks, 1500);
  };

  const reportFields: FormField[] = [
    {
      name: "reason",
      label: "Reason for Report",
      category: "selection",
      type: "picker",
      options: [
        { label: "Inappropriate Content", value: "inappropriate" },
        { label: "Incorrect Information", value: "incorrect" },
        { label: "Spam", value: "spam" },
        { label: "Other", value: "other" },
      ],
      editable: !!userData,
    },
    {
      name: "details",
      label: "Details",
      category: "text-input",
      type: "text",
      placeholder: userData
        ? "Please provide more details about your report..."
        : "Please login to submit a report",
      editable: !!userData,
    },
  ];

  if (!userData) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <HeaderWithBackButton title="Report" />
        <ErrorMessage message="Please login to submit a report" fullScreen />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <ErrorMessage message={error} onRetry={clearError} fullScreen />
      </View>
    );
  }

  if (isSuccess) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <HeaderWithBackButton title="Report" />
        <View style={styles.centerContainer}>
          <CustomText
            style={[styles.successText, { color: theme.colors.primary }]}
          >
            Report submitted successfully!
          </CustomText>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <HeaderWithBackButton title="Report" />
      <CustomText variant="titleMedium" bold>
        Submit Report
      </CustomText>
      <CustomText
        style={[styles.description, { color: theme.colors.onSurface }]}
      >
        If you've found inappropriate content or have concerns about this deck,
        please submit a report below.
      </CustomText>
      <Form
        fields={reportFields}
        onSubmit={handleSubmitReport}
        submitButtonText="Submit Report"
        style={styles.form}
        isLoading={isLoading}
        zodSchema={reportFormSchema}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  description: {
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  form: {
    marginBottom: 16,
  },
  successText: {
    fontSize: 18,
    fontWeight: "600",
  },
});
