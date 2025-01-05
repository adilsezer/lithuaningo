import { Platform } from "react-native";
import axios, { AxiosInstance } from "axios";
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
  DashboardWord,
} from "@src/types";

export class ApiError extends Error {
  constructor(public status: number, public data: any, message?: string) {
    super(message || "API Error");
    this.name = "ApiError";
  }
}

const getBaseUrl = () => {
  const url = API_KEYS.API_URL;
  if (__DEV__ && Platform.OS === "android") {
    return url?.replace("localhost", "10.0.2.2");
  }
  return url;
};

class ApiClient {
  private static instance: ApiClient;
  private axiosInstance: AxiosInstance;

  private constructor() {
    const API_BASE_URL = getBaseUrl();
    if (!API_BASE_URL) {
      throw new Error("API_BASE_URL is not configured");
    }

    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
        "X-Platform": Platform.OS,
        "X-App-Version": process.env.APP_VERSION || "1.0.0",
      },
      ...(__DEV__ && Platform.OS === "ios" ? { withCredentials: false } : {}),
    });

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: unknown) => {
        if (axios.isAxiosError(error) && error.response) {
          throw new ApiError(
            error.response.status,
            error.response.data,
            error.response.data?.message ?? error.message
          );
        }
        return Promise.reject(error);
      }
    );
  }

  static getInstance(): ApiClient {
    if (!this.instance) {
      this.instance = new ApiClient();
    }
    return this.instance;
  }

  private async request<T>(
    endpoint: string,
    options?: {
      method?: string;
      data?: any;
      params?: any;
    }
  ): Promise<T> {
    try {
      const { data } = await this.axiosInstance({
        url: endpoint,
        method: options?.method || "GET",
        data: options?.data,
        params: options?.params,
      });
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
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
    return this.request<QuizQuestion[]>(`/quiz/generate`, {
      params: { userId },
    });
  }

  async getUserProfile(userId: string) {
    return this.request<UserProfile>(`/user/${userId}`);
  }

  async getSentences(userId: string) {
    return this.request<Sentence[]>(`/user/sentences`, {
      params: { userId },
    });
  }

  async getLearnedSentences(userId: string) {
    return this.request<Sentence[]>(`/user/learned-sentences`, {
      params: { userId },
    });
  }

  async addLearnedSentences(userId: string, sentenceIds: string[]) {
    return this.request(`/user/learned-sentences`, {
      method: "POST",
      data: { userId, sentenceIds },
    });
  }

  async getLastNLearnedSentences(userId: string, count: number) {
    return this.request<Sentence[]>(`/user/last-n-learned-sentences`, {
      params: { userId, count },
    });
  }

  async createUserProfile(userId: string) {
    return this.request(`/user/create-user-profile`, {
      method: "POST",
      data: { userId },
    });
  }

  async deleteUserProfile(userId: string) {
    return this.request(`/user/delete-user-profile`, {
      method: "DELETE",
      data: { userId },
    });
  }

  async updateUserProfile(userProfile: UserProfile) {
    return this.request(`/user/update-user-profile`, {
      method: "PUT",
      data: userProfile,
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
      data: entry,
    });
  }

  async getRandomSentence(limit: number = 1) {
    return this.request<Sentence>(`/sentence/random`, {
      params: { limit },
    });
  }

  async getRandomWords(count: number = 5) {
    return this.request<DashboardWord[]>(`/word/random`, {
      params: { count },
    });
  }
}

export default ApiClient.getInstance();
