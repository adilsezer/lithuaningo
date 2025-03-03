import { MD3Theme } from "react-native-paper";

export interface TrendAnalysis {
  trend: "improving" | "declining" | "stable";
  description: string;
  icon: string;
  color: string;
}

export interface PracticeStats {
  totalCards: number;
  remainingCards: number;
  correctCount: number;
  totalAnswered: number;
  currentStreak: number;
  bestStreak: number;
  accuracy: string;
  accuracyPercent: number;
  performanceLabel: string;
  sessionDuration: string;
  learningPace: number;
  estimatedTimeToFinish: string;
  averageResponseTime: number;
  hasResponseTimes: boolean;
  trendAnalysis: TrendAnalysis;
}

export interface StatsPanelProps {
  statsTab: string;
  setStatsTab: (tab: string) => void;
  stats: PracticeStats;
  theme: MD3Theme;
}

export interface CompletedScreenProps {
  stats: PracticeStats;
  handleRestartPractice: () => void;
  theme: MD3Theme;
}
