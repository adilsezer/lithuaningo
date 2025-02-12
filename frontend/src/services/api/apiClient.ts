import { Platform } from "react-native";
import axios, { AxiosInstance, AxiosError } from "axios";
import { API_KEYS } from "@config/constants";
import {
  Lemma,
  WordForm,
  QuizQuestion,
  UserProfile,
  Announcement,
  AppInfo,
  Deck,
  Flashcard,
  DeckComment,
  LeaderboardWeek,
  ChallengeStats,
  DeckReport,
  UserFlashcardStats,
  TrackProgressRequest,
  QuizResult,
  CreateQuizQuestionRequest,
  CreateUserProfileRequest,
  UpdateUserProfileRequest,
} from "@src/types";
import { supabase } from "@services/supabase/supabaseClient";
import Constants from "expo-constants";
import { useUserStore } from "@stores/useUserStore";

export class ApiError extends Error {
  constructor(public status: number, public data: any, message?: string) {
    super(message || "API Error");
    this.name = "ApiError";
  }
}

const getBaseUrl = () => {
  const url = API_KEYS.API_URL;
  if (__DEV__ && Platform.OS === "android") {
    const modifiedUrl = url?.replace("localhost", "10.0.2.2");
    return modifiedUrl;
  }
  return url;
};

class ApiClient {
  private static instance: ApiClient;
  private axiosInstance: AxiosInstance;
  private baseURL: string;

  private constructor() {
    this.baseURL = getBaseUrl() || "http://localhost:7016";
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
        "X-Platform": Platform.OS,
        "X-App-Version": process.env.APP_VERSION || "1.0.0",
      },
    });

    this.setupAuthInterceptors();
  }

  static getInstance(): ApiClient {
    if (!this.instance) {
      this.instance = new ApiClient();
    }
    return this.instance;
  }

  private setupAuthInterceptors() {
    // Request interceptor for authentication
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const session = await supabase.auth.getSession();
        const token = session?.data.session?.access_token;

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        console.error("[API Request Error]", {
          message: error.message,
          config: error.config,
        });
        return Promise.reject(error);
      }
    );

    // Response interceptor for auth errors
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        console.error("[API Response Error]", {
          message: error.message,
          status: error.response?.status,
          url: error.config?.url,
          response: error.response?.data,
        });

        if (error.response?.status === 401) {
          const { setAuthenticated } = useUserStore.getState();
          await supabase.auth.signOut();
          setAuthenticated(false);
        }
        return Promise.reject(error);
      }
    );

    // Add these interceptors after your existing axios instance creation
    this.axiosInstance.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => {
        console.error("[ApiClient] Request Error:", error);
        return Promise.reject(error);
      }
    );

    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  private async request<T>(
    endpoint: string,
    options?: {
      method?: string;
      data?: any;
      params?: any;
      headers?: Record<string, string>;
    }
  ): Promise<T> {
    try {
      const { data } = await this.axiosInstance({
        url: endpoint,
        method: options?.method || "GET",
        data: options?.data,
        params: options?.params,
        headers: options?.headers,
      });
      return data;
    } catch (error) {
      console.error("[ApiClient] Request failed:", {
        endpoint,
        error,
      });
      if (error instanceof ApiError) {
        throw error;
      }
      throw error;
    }
  }

  // Word Controller
  async getWordForm(word: string): Promise<WordForm> {
    return this.request<WordForm>(`/api/v1/word/${word}`);
  }

  async getLemma(lemma: string): Promise<Lemma> {
    return this.request<Lemma>(`/api/v1/word/lemma/${lemma}`);
  }

  // Quiz Controller
  async getDailyQuiz(): Promise<QuizQuestion[]> {
    return this.request<QuizQuestion[]>(`/api/v1/quiz/daily`);
  }

  async submitQuizResult(
    result: Omit<QuizResult, "completedAt">
  ): Promise<void> {
    return this.request(`/api/v1/quiz/result`, {
      method: "POST",
      data: result,
    });
  }

  async getQuizHistory(userId: string): Promise<QuizResult[]> {
    return this.request<QuizResult[]>(`/api/v1/quiz/history/${userId}`);
  }

  async createDailyQuiz(
    questions: CreateQuizQuestionRequest[]
  ): Promise<QuizQuestion[]> {
    return this.request<QuizQuestion[]>(`/api/v1/quiz/daily`, {
      method: "POST",
      data: questions,
    });
  }

  // User Profile Controller
  async getUserProfile(id: string): Promise<UserProfile> {
    return this.request<UserProfile>(`/api/v1/userprofile/${id}`);
  }

  async createUserProfile(
    request: CreateUserProfileRequest
  ): Promise<UserProfile> {
    return this.request<UserProfile>(`/api/v1/userprofile`, {
      method: "POST",
      data: request,
    });
  }

  async updateUserProfile(
    id: string,
    profile: UpdateUserProfileRequest
  ): Promise<UserProfile> {
    return this.request<UserProfile>(`/api/v1/userprofile/${id}`, {
      method: "PUT",
      data: profile,
    });
  }

  async deleteUserProfile(id: string): Promise<void> {
    return this.request(`/api/v1/userprofile/${id}`, {
      method: "DELETE",
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    return this.request(`/api/v1/userprofile/${id}/login`, {
      method: "POST",
    });
  }

  // Announcement Controller
  async getAnnouncements(): Promise<Announcement[]> {
    return this.request<Announcement[]>(`/api/v1/announcement`);
  }

  async getAnnouncementById(id: string): Promise<Announcement> {
    return this.request<Announcement>(`/api/v1/announcement/${id}`);
  }

  async createAnnouncement(
    announcement: Partial<Announcement>
  ): Promise<Announcement> {
    return this.request<Announcement>(`/api/v1/announcement`, {
      method: "POST",
      data: announcement,
    });
  }

  async updateAnnouncement(
    id: string,
    announcement: Partial<Announcement>
  ): Promise<void> {
    return this.request(`/api/v1/announcement/${id}`, {
      method: "PUT",
      data: announcement,
    });
  }

  async deleteAnnouncement(id: string): Promise<void> {
    return this.request(`/api/v1/announcement/${id}`, {
      method: "DELETE",
    });
  }

  // App Info Controller
  async getAppInfo(platform: string = Platform.OS): Promise<AppInfo> {
    try {
      const response = await this.request<AppInfo>(
        `/api/v1/AppInfo/${platform}`
      );
      return response;
    } catch (error) {
      console.error("[getAppInfo] Error", {
        error,
        platform,
        baseURL: this.baseURL,
      });
      throw error;
    }
  }

  async updateAppInfo(
    platform: string,
    info: Partial<AppInfo>
  ): Promise<AppInfo> {
    return this.request<AppInfo>(`/api/v1/AppInfo/${platform}`, {
      method: "PUT",
      data: info,
    });
  }

  async deleteAppInfo(id: string): Promise<void> {
    return this.request(`/api/v1/AppInfo/${id}`, {
      method: "DELETE",
    });
  }

  // Challenge Stats Controller
  async getChallengeStats(userId: string): Promise<ChallengeStats> {
    return this.request<ChallengeStats>(
      `/api/v1/ChallengeStats/${userId}/stats`
    );
  }

  async updateChallengeStats(
    userId: string,
    stats: Partial<ChallengeStats>
  ): Promise<ChallengeStats> {
    return this.request<ChallengeStats>(
      `/api/v1/ChallengeStats/${userId}/stats`,
      {
        method: "PUT",
        data: stats,
      }
    );
  }

  async updateWeeklyGoal(userId: string, goal: number): Promise<void> {
    return this.request(`/api/v1/ChallengeStats/${userId}/stats/weekly-goal`, {
      method: "PUT",
      data: { goal },
    });
  }

  async incrementCardsReviewed(userId: string): Promise<void> {
    return this.request(
      `/api/v1/ChallengeStats/${userId}/stats/cards-reviewed`,
      {
        method: "POST",
      }
    );
  }

  async incrementCardsMastered(userId: string): Promise<void> {
    return this.request(
      `/api/v1/ChallengeStats/${userId}/stats/cards-mastered`,
      {
        method: "POST",
      }
    );
  }

  // Deck Comment Controller
  async getDeckComments(deckId: string): Promise<DeckComment[]> {
    return this.request<DeckComment[]>(`/api/v1/deckcomment/deck/${deckId}`);
  }

  async createDeckComment(comment: {
    deckId: string;
    userId: string;
    content: string;
    rating?: number;
    tags?: string[];
  }): Promise<DeckComment> {
    return this.request<DeckComment>(`/api/v1/deckcomment`, {
      method: "POST",
      data: comment,
    });
  }

  async getDeckComment(id: string): Promise<DeckComment> {
    return this.request<DeckComment>(`/api/v1/deckcomment/${id}`);
  }

  async updateDeckComment(
    id: string,
    comment: Partial<DeckComment>
  ): Promise<DeckComment> {
    return this.request<DeckComment>(`/api/v1/deckcomment/${id}`, {
      method: "PUT",
      data: comment,
    });
  }

  async deleteDeckComment(id: string): Promise<void> {
    return this.request(`/api/v1/deckcomment/${id}`, {
      method: "DELETE",
    });
  }

  async getUserDeckComments(userId: string): Promise<DeckComment[]> {
    return this.request<DeckComment[]>(`/api/v1/deckcomment/user/${userId}`);
  }

  // Deck Controller
  async getPublicDecks(): Promise<Deck[]> {
    return this.request<Deck[]>(`/api/v1/deck`);
  }

  async getDeck(id: string): Promise<Deck> {
    return this.request<Deck>(`/api/v1/deck/${id}`);
  }

  async createDeck(deck: Partial<Deck>): Promise<Deck> {
    return this.request<Deck>(`/api/v1/deck`, {
      method: "POST",
      data: deck,
    });
  }

  async updateDeck(id: string, deck: Partial<Deck>): Promise<Deck> {
    return this.request<Deck>(`/api/v1/deck/${id}`, {
      method: "PUT",
      data: deck,
    });
  }

  async deleteDeck(id: string): Promise<void> {
    return this.request(`/api/v1/deck/${id}`, {
      method: "DELETE",
    });
  }

  async getUserDecks(userId: string): Promise<Deck[]> {
    return this.request<Deck[]>(`/api/v1/deck/user/${userId}`);
  }

  async getTopRatedDecks(
    limit: number = 10,
    timeRange: "week" | "month" | "all" = "all"
  ): Promise<Deck[]> {
    return this.request<Deck[]>(`/api/v1/deck/top-rated`, {
      params: { limit, timeRange },
    });
  }

  async voteDeck(
    id: string,
    userId: string,
    isUpvote: boolean
  ): Promise<boolean> {
    return this.request<boolean>(`/api/v1/deck/${id}/vote`, {
      method: "POST",
      params: { userId, isUpvote },
    });
  }

  async reportDeck(id: string, userId: string, reason: string): Promise<void> {
    return this.request(`/api/v1/deck/${id}/report`, {
      method: "POST",
      params: { userId },
      data: reason,
    });
  }

  async searchDecks(query: string, category?: string): Promise<Deck[]> {
    return this.request<Deck[]>(`/api/v1/deck/search`, {
      params: { query, category },
    });
  }

  async getDeckFlashcards(deckId: string): Promise<Flashcard[]> {
    return this.request<Flashcard[]>(`/api/v1/deck/${deckId}/flashcards`);
  }

  async getDeckRating(id: string, timeRange: string = "all"): Promise<number> {
    return this.request<number>(`/api/v1/deck/${id}/rating`, {
      params: { timeRange },
    });
  }

  // Deck Report Controller
  async createDeckReport(report: {
    deckId: string;
    reporterId: string;
    reason: string;
    details: string;
  }): Promise<DeckReport> {
    return this.request<DeckReport>(`/api/v1/deckreport`, {
      method: "POST",
      data: report,
    });
  }

  async getDeckReports(
    status: string = "pending",
    limit: number = 50
  ): Promise<DeckReport[]> {
    return this.request<DeckReport[]>(`/api/v1/deckreport`, {
      params: { status, limit },
    });
  }

  async getDeckReport(id: string): Promise<DeckReport> {
    return this.request<DeckReport>(`/api/v1/deckreport/${id}`);
  }

  async getDeckReportsByDeckId(deckId: string): Promise<DeckReport[]> {
    return this.request<DeckReport[]>(`/api/v1/deckreport/deck/${deckId}`);
  }

  async updateDeckReportStatus(
    id: string,
    request: { status: string; reviewedBy: string; resolution?: string }
  ): Promise<DeckReport> {
    return this.request<DeckReport>(`/api/v1/deckreport/${id}/status`, {
      method: "PUT",
      data: request,
    });
  }

  async deleteDeckReport(id: string): Promise<void> {
    return this.request(`/api/v1/deckreport/${id}`, {
      method: "DELETE",
    });
  }

  async trackProgress(
    deckId: string,
    request: TrackProgressRequest
  ): Promise<void> {
    return this.request(`/api/v1/userflashcardstats/${deckId}/track`, {
      method: "POST",
      data: request,
    });
  }

  async getUserFlashcardStats(
    deckId: string,
    userId: string
  ): Promise<UserFlashcardStats> {
    return this.request<UserFlashcardStats>(
      `/api/v1/userflashcardstats/${deckId}/stats`,
      {
        params: { userId },
      }
    );
  }

  async getUserFlashcardHistory(userId: string): Promise<UserFlashcardStats[]> {
    return this.request<UserFlashcardStats[]>(
      `/api/v1/userflashcardstats/user/${userId}/history`
    );
  }

  // Leaderboard Controller
  async getCurrentWeekLeaderboard(): Promise<LeaderboardWeek> {
    return this.request<LeaderboardWeek>(`/api/v1/leaderboard/current`);
  }

  async getWeekLeaderboard(weekId: string): Promise<LeaderboardWeek> {
    return this.request<LeaderboardWeek>(`/api/v1/leaderboard/${weekId}`);
  }

  async updateLeaderboardEntry(request: {
    userId: string;
    name: string;
    score: number;
  }): Promise<void> {
    return this.request(`/api/v1/leaderboard/entry`, {
      method: "POST",
      data: request,
    });
  }

  async createFlashcard(
    flashcard: Pick<
      Flashcard,
      "deckId" | "frontText" | "backText" | "imageUrl" | "audioUrl"
    >
  ): Promise<string> {
    const response = await axios.post(`${this.baseURL}/flashcards`, flashcard);
    return response.data;
  }

  async updateFlashcard(
    id: string,
    flashcard: Pick<
      Flashcard,
      "frontText" | "backText" | "imageUrl" | "audioUrl"
    >
  ) {
    const response = await axios.put(
      `${this.baseURL}/flashcards/${id}`,
      flashcard
    );
    return response.data;
  }

  async uploadFile(formData: FormData): Promise<string> {
    const response = await axios.post(
      `${this.baseURL}/files/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.url;
  }

  async deleteFlashcard(id: string) {
    const response = await axios.delete(`${this.baseURL}/flashcards/${id}`);
    return response.data;
  }

  async getFlashcardById(id: string): Promise<Flashcard> {
    const response = await axios.get(`${this.baseURL}/flashcards/${id}`);
    return response.data;
  }

  async updateReviewStatus(id: string, data: { wasCorrect: boolean }) {
    const response = await axios.post(
      `${this.baseURL}/flashcards/${id}/review`,
      data
    );
    return response.data;
  }

  private handleError(error: any) {
    if (error.response) {
      // Server responded with error
      throw new Error(error.response.data?.message || "Server error occurred");
    } else if (error.request) {
      // Request made but no response
      throw new Error("No response from server");
    } else {
      // Other errors
      throw error;
    }
  }
}

export default ApiClient.getInstance();
