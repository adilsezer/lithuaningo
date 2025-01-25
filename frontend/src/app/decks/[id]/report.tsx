import React, { useState, useCallback } from "react";
import { View, StyleSheet, Text } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useThemeStyles } from "@hooks/useThemeStyles";
import { useUserData } from "@stores/useUserStore";
import { useReport } from "@hooks/useReport";
import { SectionTitle } from "@components/typography";
import { Form } from "@components/form/Form";
import { FormField } from "@components/form/form.types";
import { ErrorMessage } from "@components/ui/ErrorMessage";
import BackButton from "@components/layout/BackButton";

export default function ReportScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useThemeStyles();
  const userData = useUserData();
  const { isLoading, error, submitReport, clearError } = useReport();
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
      contentId: id as string,
      reportedBy: userData.id,
      reason: data.reason,
      details: data.details,
    });

    setIsSuccess(true);
    // Navigate to decks dashboard after a short delay
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
      validation: {
        required: true,
        message: "Please select a reason",
      },
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
      validation: {
        required: true,
        message: "Details cannot be empty",
        minLength: 10,
      },
      editable: !!userData,
    },
  ];

  if (!userData) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <BackButton />
        <ErrorMessage message="Please login to submit a report" fullScreen />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ErrorMessage message={error} onRetry={clearError} fullScreen />
      </View>
    );
  }

  if (isSuccess) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <BackButton />
        <View style={styles.centerContainer}>
          <Text style={[styles.successText, { color: colors.success }]}>
            Report submitted successfully!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <BackButton />
      <SectionTitle>Submit Report</SectionTitle>
      <Text style={[styles.description, { color: colors.text }]}>
        If you've found inappropriate content or have concerns about this deck,
        please submit a report below.
      </Text>
      <Form
        fields={reportFields}
        onSubmit={handleSubmitReport}
        submitButtonText="Submit Report"
        style={styles.form}
        isLoading={isLoading}
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
