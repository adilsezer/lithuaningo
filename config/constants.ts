export const API_KEYS = {
  GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  ANDROID_GOOGLE_SERVICES_BASE64: process.env.ANDROID_GOOGLE_SERVICES_BASE64,
  IOS_GOOGLE_SERVICES_BASE64: process.env.IOS_GOOGLE_SERVICES_BASE64,
};

export const COLLECTIONS = {
  USERS: "userProfiles",
  SENTENCES: "sentences",
  WORDS: "words",
  PENDING_WORDS: "pendingWords",
  MISSING_WORDS: "missingWords",
  ANNOUNCEMENTS: "announcements",
  APP_INFO: "appInfo",
};

export const NOTIFICATION_KEYS = {
  REMINDER_ENABLED: "reminderEnabled",
  REMINDER_TIME: "reminderTime",
  NOTIFICATION_PROMPT_KEY: "hasPromptedForNotifications",
};

export const APP_INFO_KEYS = {
  LATEST_VERSION: "latestVersion",
  MANDATORY_UPDATE: "mandatoryUpdate",
  UPDATE_URL: "updateUrl",
  IS_UNDER_MAINTENANCE: "isUnderMaintenance",
};

export const THEME_KEYS = {
  THEME: "theme",
};

export const QUIZ_KEYS = {
  QUIZ_QUESTIONS_KEY: (userId: string, dateKey: string) =>
    `quizQuestions_${userId}_${dateKey}`,
  QUIZ_PROGRESS_KEY: (userId: string, dateKey: string) =>
    `quizProgress_${userId}_${dateKey}`,
  INCORRECT_QUESTIONS_KEY: (userId: string, dateKey: string) =>
    `incorrectQuestions_${userId}_${dateKey}`,
  INCORRECT_PROGRESS_KEY: (userId: string, dateKey: string) =>
    `incorrectProgress_${userId}_${dateKey}`,
  SESSION_STATE_KEY: (userId: string, dateKey: string) =>
    `sessionState_${userId}_${dateKey}`,
};

export const SENTENCE_KEYS = {
  COMPLETION_STATUS_KEY: (userId: string, dateKey: string) =>
    `completionStatus_${userId}_${dateKey}`,
  SENTENCES_KEY: (userId: string, dateKey: string) =>
    `sentences_${userId}_${dateKey}`,
};
