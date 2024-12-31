import { Platform } from "react-native";
import { API_KEYS } from "@config/constants";
import {
  Lemma,
  WordForm,
  QuizQuestion,
  Sentence,
  UserProfile,
  Announcement,
  AppInfo,
  LeaderboardEntry,
} from "@src/types";

const getBaseUrl = () => {
  const url = API_KEYS.API_URL;

  if (__DEV__) {
    if (Platform.OS === "android") {
      // Replacing localhost with 10.0.2.2 for Android emulator
      return url?.replace("localhost", "10.0.2.2");
    }
  }
  return url;
};

class ApiClient {
  private static instance: ApiClient;

  private constructor() {}

  static getInstance(): ApiClient {
    if (!this.instance) {
      this.instance = new ApiClient();
    }
    return this.instance;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const API_BASE_URL = getBaseUrl();
    if (!API_BASE_URL) {
      console.error("API_BASE_URL is undefined or null");
      throw new Error("API_BASE_URL is not configured");
    }

    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        ...(__DEV__ && Platform.OS === "ios"
          ? {
              credentials: "omit",
            }
          : {}),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("[API Error]", errorBody);
        throw new Error(
          `HTTP error! status: ${response.status}, body: ${errorBody}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(
        "[API Error]",
        error instanceof Error ? error.message : error
      );
      throw error;
    }
  }

  async getWordForm(word: string) {
    return this.request<WordForm>(`/word/${word}`);
  }

  async getLemma(lemma: string) {
    return this.request<Lemma>(`/word/lemma/${lemma}`);
  }

  async generateQuiz(userId: string) {
    return this.request<QuizQuestion[]>(`/quiz/generate?userId=${userId}`);
  }

  async getUserProfile(userId: string) {
    return this.request<UserProfile>(`/user/${userId}`);
  }

  async getSentences(userId: string) {
    return this.request<Sentence[]>(`/user/sentences?userId=${userId}`);
  }

  async getLearnedSentences(userId: string) {
    return this.request<Sentence[]>(`/user/learned-sentences?userId=${userId}`);
  }

  async addLearnedSentences(userId: string, sentenceIds: string[]) {
    return this.request(`/user/learned-sentences`, {
      method: "POST",
      body: JSON.stringify({ userId, sentenceIds }),
    });
  }

  async getLastNLearnedSentences(userId: string, count: number) {
    return this.request<Sentence[]>(
      `/user/last-n-learned-sentences?userId=${userId}&count=${count}`
    );
  }

  async createUserProfile(userId: string) {
    return this.request(`/user/create-user-profile`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  }

  async deleteUserProfile(userId: string) {
    return this.request(`/user/delete-user-profile`, {
      method: "DELETE",
      body: JSON.stringify({ userId }),
    });
  }

  async updateUserProfile(userProfile: UserProfile) {
    return this.request(`/user/update-user-profile`, {
      method: "PUT",
      body: JSON.stringify(userProfile),
    });
  }

  async getAnnouncements() {
    return this.request<Announcement[]>(`/announcement`);
  }

  async getAppInfo() {
    return this.request<AppInfo>(`/appInfo/${Platform.OS}`);
  }

  async getLeaderboardEntries() {
    return this.request<LeaderboardEntry[]>(`/leaderboard`);
  }

  async updateLeaderboardEntry(entry: LeaderboardEntry) {
    return this.request(`/leaderboard`, {
      method: "PUT",
      body: JSON.stringify(entry),
    });
  }

  async getRandomSentence(limit: number = 1) {
    return this.request<Sentence>(`/sentence/random?limit=${limit}`);
  }
}

export default ApiClient.getInstance();
