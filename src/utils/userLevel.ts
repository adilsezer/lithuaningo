// src/utils/userLevel.ts

import { Stats } from "../services/FirebaseDataService";

// Define user levels
export enum UserLevel {
  Beginner = "Beginner",
  Intermediate = "Intermediate",
  Advanced = "Advanced",
  Expert = "Expert",
}

// Function to determine user level
export const determineUserLevel = (stats: Stats | null): UserLevel => {
  if (!stats) {
    return UserLevel.Beginner; // Default to Beginner if stats are null
  }

  const {
    totalStudiedCards,
    longestStreak,
    minutesSpentTotal,
    correctAnswers,
  } = stats;

  // Define weights for each metric
  const weights = {
    totalStudiedCards: 0.4,
    longestStreak: 0.3,
    minutesSpentTotal: 0.2,
    correctAnswers: 0.1,
  };

  // Calculate a composite score
  const compositeScore =
    totalStudiedCards * weights.totalStudiedCards +
    longestStreak * weights.longestStreak +
    minutesSpentTotal * weights.minutesSpentTotal +
    correctAnswers * weights.correctAnswers;

  // Define thresholds for each level based on composite score
  if (compositeScore >= 8000) {
    return UserLevel.Expert;
  } else if (compositeScore >= 4000) {
    return UserLevel.Advanced;
  } else if (compositeScore >= 2000) {
    return UserLevel.Intermediate;
  } else {
    return UserLevel.Beginner;
  }
};
