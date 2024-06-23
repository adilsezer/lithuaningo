// src/utils/userLevel.ts

import { Stats } from "../services/data/userStatsService";

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
    totalAnsweredQuestions: totalAnsweredQuestions,
    longestStreak,
    minutesSpentTotal,
  } = stats;

  // Define weights for each metric
  const weights = {
    totalAnsweredQuestions: 0.3,
    longestStreak: 0.2,
    minutesSpentTotal: 0.1,
  };

  // Calculate a composite score
  const compositeScore =
    totalAnsweredQuestions * weights.totalAnsweredQuestions +
    longestStreak * weights.longestStreak +
    minutesSpentTotal * weights.minutesSpentTotal;

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
