import { Platform } from "react-native";
import axios, { AxiosInstance } from "axios";
import { API_KEYS } from "@config/constants";
import {
  QuizQuestion,
  UserProfile,
  Announcement,
  AppInfo,
  Deck,
  Flashcard,
  DeckComment,
  UserChallengeStats,
  DeckReport,
  UserFlashcardStats,
  TrackProgressRequest,
  QuizResult,
  CreateQuizQuestionRequest,
  UpdateUserProfileRequest,
  UpdateAppInfoRequest,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
  CreateDeckReportRequest,
  UpdateDeckReportRequest,
  CreateDeckVoteRequest,
  DeckVote,
  CreateFlashcardRequest,
  UpdateFlashcardRequest,
  UpdateLeaderboardEntryRequest,
  LeaderboardEntry,
} from "@src/types";
import { supabase } from "@services/supabase/supabaseClient";
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
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          console.warn(
            "[ApiClient] No auth token available for request:",
            config.url
          );
        }
        return config;
      },
      (error) => {
        console.error("[ApiClient] Request interceptor error:", {
          message: error.message,
          config: error.config,
          url: error.config?.url,
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
        console.error("[ApiClient] Response error:", {
          message: error.message,
          status: error.response?.status,
          url: error.config?.url,
          data: error.response?.data,
          headers: error.config?.headers,
        });

        if (error.response?.status === 401) {
          console.warn("[ApiClient] Unauthorized request, signing out user");
          const { setAuthenticated } = useUserStore.getState();
          await supabase.auth.signOut();
          setAuthenticated(false);
        }
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

  // Quiz Controller
  async getDailyQuiz(): Promise<QuizQuestion[]> {
    return this.request<QuizQuestion[]>(`/api/v1/Quiz/daily`);
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
    return this.request<QuizResult[]>(`/api/v1/Quiz/history/${userId}`);
  }

  async createDailyQuiz(
    questions: CreateQuizQuestionRequest[]
  ): Promise<QuizQuestion[]> {
    return this.request<QuizQuestion[]>(`/api/v1/Quiz/daily`, {
      method: "POST",
      data: questions,
    });
  }

  // User Profile Controller
  async getUserProfile(userId: string): Promise<UserProfile> {
    return this.request<UserProfile>(`/api/v1/UserProfile/${userId}`);
  }

  async updateUserProfile(
    id: string,
    profile: UpdateUserProfileRequest
  ): Promise<UserProfile> {
    try {
      const updatedProfile = await this.request<UserProfile>(
        `/api/v1/UserProfile/${id}`,
        {
          method: "PUT",
          data: profile,
        }
      );
      return updatedProfile;
    } catch (error) {
      console.error("[ApiClient] Failed to update user profile:", {
        id,
        profile,
        error,
      });
      throw error;
    }
  }

  async deleteUserProfile(id: string): Promise<void> {
    try {
      await this.request(`/api/v1/UserProfile/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("[ApiClient] Failed to delete user profile:", {
        userId: id,
        error,
      });
      throw error;
    }
  }

  async updateLastLogin(id: string): Promise<void> {
    try {
      await this.request(`/api/v1/UserProfile/${id}/login`, {
        method: "POST",
      });
    } catch (error) {
      console.error("[ApiClient] Failed to update last login:", {
        userId: id,
        error,
      });
      throw error;
    }
  }

  // Announcement Controller
  async getAnnouncements(): Promise<Announcement[]> {
    return this.request<Announcement[]>(`/api/v1/Announcement`);
  }

  async getAnnouncementById(id: string): Promise<Announcement> {
    return this.request<Announcement>(`/api/v1/Announcement/${id}`);
  }

  async createAnnouncement(
    request: CreateAnnouncementRequest
  ): Promise<Announcement> {
    return this.request<Announcement>(`/api/v1/Announcement`, {
      method: "POST",
      data: request,
    });
  }

  async updateAnnouncement(
    id: string,
    request: UpdateAnnouncementRequest
  ): Promise<Announcement> {
    return this.request<Announcement>(`/api/v1/Announcement/${id}`, {
      method: "PUT",
      data: request,
    });
  }

  async deleteAnnouncement(id: string): Promise<void> {
    return this.request(`/api/v1/Announcement/${id}`, {
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
    info: UpdateAppInfoRequest
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

  // User Challenge Stats Controller
  async getUserChallengeStats(userId: string): Promise<UserChallengeStats> {
    return this.request<UserChallengeStats>(
      `/api/v1/UserChallengeStats/${userId}/stats`
    );
  }

  async updateUserChallengeStats(
    userId: string,
    stats: Partial<UserChallengeStats>
  ): Promise<UserChallengeStats> {
    return this.request<UserChallengeStats>(
      `/api/v1/UserChallengeStats/${userId}/stats`,
      {
        method: "PUT",
        data: stats,
      }
    );
  }

  async updateWeeklyGoal(userId: string, goal: number): Promise<void> {
    return this.request(
      `/api/v1/UserChallengeStats/${userId}/stats/weekly-goal`,
      {
        method: "PUT",
        data: { goal },
      }
    );
  }

  async incrementCardsReviewed(userId: string): Promise<void> {
    return this.request(
      `/api/v1/UserChallengeStats/${userId}/stats/cards-reviewed`,
      {
        method: "POST",
      }
    );
  }

  async incrementCardsMastered(userId: string): Promise<void> {
    return this.request(
      `/api/v1/UserChallengeStats/${userId}/stats/cards-mastered`,
      {
        method: "POST",
      }
    );
  }

  async updateDailyStreak(userId: string): Promise<void> {
    return this.request(`/api/v1/UserChallengeStats/${userId}/stats/streak`, {
      method: "POST",
    });
  }

  async incrementQuizzesCompleted(userId: string): Promise<void> {
    return this.request(
      `/api/v1/UserChallengeStats/${userId}/stats/quiz-completed`,
      {
        method: "POST",
      }
    );
  }

  // Deck Comment Controller
  async getDeckComments(deckId: string): Promise<DeckComment[]> {
    return this.request<DeckComment[]>(`/api/v1/DeckComment/deck/${deckId}`);
  }

  async createDeckComment(comment: {
    deckId: string;
    userId: string;
    content: string;
    rating?: number;
    tags?: string[];
  }): Promise<DeckComment> {
    return this.request<DeckComment>(`/api/v1/DeckComment`, {
      method: "POST",
      data: comment,
    });
  }

  async getDeckComment(id: string): Promise<DeckComment> {
    return this.request<DeckComment>(`/api/v1/DeckComment/${id}`);
  }

  async updateDeckComment(
    id: string,
    comment: Partial<DeckComment>
  ): Promise<DeckComment> {
    return this.request<DeckComment>(`/api/v1/DeckComment/${id}`, {
      method: "PUT",
      data: comment,
    });
  }

  async deleteDeckComment(id: string): Promise<void> {
    return this.request(`/api/v1/DeckComment/${id}`, {
      method: "DELETE",
    });
  }

  async getUserDeckComments(userId: string): Promise<DeckComment[]> {
    return this.request<DeckComment[]>(`/api/v1/DeckComment/user/${userId}`);
  }

  // Deck Controller
  async getPublicDecks(): Promise<Deck[]> {
    return this.request<Deck[]>(`/api/v1/Deck`);
  }

  async getDeck(id: string): Promise<Deck> {
    return this.request<Deck>(`/api/v1/Deck/${id}`);
  }

  async createDeck(deck: Partial<Deck>): Promise<Deck> {
    return this.request<Deck>(`/api/v1/Deck`, {
      method: "POST",
      data: deck,
    });
  }

  async updateDeck(id: string, deck: Partial<Deck>): Promise<Deck> {
    return this.request<Deck>(`/api/v1/Deck/${id}`, {
      method: "PUT",
      data: deck,
    });
  }

  async deleteDeck(id: string): Promise<void> {
    return this.request(`/api/v1/Deck/${id}`, {
      method: "DELETE",
    });
  }

  async getUserDecks(userId: string): Promise<Deck[]> {
    return this.request<Deck[]>(`/api/v1/Deck/user/${userId}`);
  }

  async getTopRatedDecks(
    limit: number = 10,
    timeRange: "week" | "month" | "all" = "all"
  ): Promise<Deck[]> {
    return this.request<Deck[]>(`/api/v1/Deck/top-rated`, {
      params: { limit, timeRange },
    });
  }

  async reportDeck(id: string, userId: string, reason: string): Promise<void> {
    return this.request(`/api/v1/DeckReport/${id}`, {
      method: "POST",
      params: { userId },
      data: reason,
    });
  }

  async searchDecks(query: string, category?: string): Promise<Deck[]> {
    return this.request<Deck[]>(`/api/v1/Deck/search`, {
      params: { query, category },
    });
  }

  async getDeckFlashcards(deckId: string): Promise<Flashcard[]> {
    return this.request<Flashcard[]>(`/api/v1/Deck/${deckId}/flashcards`);
  }

  // Deck Report Controller
  async createDeckReport(
    request: CreateDeckReportRequest
  ): Promise<DeckReport> {
    return this.request<DeckReport>(`/api/v1/DeckReport`, {
      method: "POST",
      data: request,
    });
  }

  async getDeckReports(
    status: string = "pending",
    limit: number = 50
  ): Promise<DeckReport[]> {
    return this.request<DeckReport[]>(`/api/v1/DeckReport`, {
      params: { status, limit },
    });
  }

  async getDeckReport(id: string): Promise<DeckReport> {
    return this.request<DeckReport>(`/api/v1/DeckReport/${id}`);
  }

  async getDeckReportsByDeckId(deckId: string): Promise<DeckReport[]> {
    return this.request<DeckReport[]>(`/api/v1/DeckReport/deck/${deckId}`);
  }

  async updateDeckReportStatus(
    id: string,
    request: UpdateDeckReportRequest
  ): Promise<DeckReport> {
    return this.request<DeckReport>(`/api/v1/DeckReport/${id}/status`, {
      method: "PUT",
      data: request,
    });
  }

  async deleteDeckReport(id: string): Promise<void> {
    return this.request(`/api/v1/DeckReport/${id}`, {
      method: "DELETE",
    });
  }

  async trackProgress(
    deckId: string,
    request: TrackProgressRequest
  ): Promise<void> {
    return this.request(`/api/v1/UserFlashcardStats/${deckId}/track`, {
      method: "POST",
      data: request,
    });
  }

  async getUserFlashcardStats(
    deckId: string,
    userId: string
  ): Promise<UserFlashcardStats> {
    return this.request<UserFlashcardStats>(
      `/api/v1/UserFlashcardStats/${deckId}/stats`,
      {
        params: { userId },
      }
    );
  }

  async getUserFlashcardHistory(userId: string): Promise<UserFlashcardStats[]> {
    return this.request<UserFlashcardStats[]>(
      `/api/v1/UserFlashcardStats/user/${userId}/history`
    );
  }

  // Leaderboard Controller
  async getCurrentWeekLeaderboard(): Promise<LeaderboardEntry[]> {
    return this.request<LeaderboardEntry[]>(`/api/v1/Leaderboard/current`);
  }

  async updateLeaderboardEntry(
    request: UpdateLeaderboardEntryRequest
  ): Promise<LeaderboardEntry> {
    return this.request<LeaderboardEntry>(`/api/v1/Leaderboard/entry`, {
      method: "POST",
      data: request,
    });
  }

  // Deck Vote Controller
  async createDeckVote(request: CreateDeckVoteRequest): Promise<boolean> {
    return this.request<boolean>(`/api/v1/DeckVote`, {
      method: "POST",
      data: request,
    });
  }

  async getUserVote(deckId: string, userId: string): Promise<DeckVote | null> {
    return this.request<DeckVote | null>(
      `/api/v1/DeckVote/${deckId}/user/${userId}`
    );
  }

  async getDeckVotes(deckId: string): Promise<DeckVote[]> {
    return this.request<DeckVote[]>(`/api/v1/DeckVote/${deckId}`);
  }

  async getVoteCounts(
    deckId: string
  ): Promise<{ upvotes: number; downvotes: number }> {
    return this.request<{ upvotes: number; downvotes: number }>(
      `/api/v1/DeckVote/${deckId}/counts`
    );
  }

  // Flashcard Controller
  async createFlashcard(flashcard: CreateFlashcardRequest): Promise<string> {
    return this.request<string>(`/api/v1/Flashcard`, {
      method: "POST",
      data: flashcard,
    });
  }

  async updateFlashcard(id: string, flashcard: UpdateFlashcardRequest) {
    return this.request(`/api/v1/Flashcard/${id}`, {
      method: "PUT",
      data: flashcard,
    });
  }

  async uploadFile(formData: FormData): Promise<string> {
    return this.request<string>(`/api/v1/Flashcard/upload`, {
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  async uploadDeckFile(formData: FormData): Promise<string> {
    return this.request<string>(`/api/v1/Deck/upload`, {
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  async deleteFlashcard(id: string) {
    return this.request(`/api/v1/Flashcard/${id}`, {
      method: "DELETE",
    });
  }

  async getFlashcardById(id: string): Promise<Flashcard> {
    return this.request<Flashcard>(`/api/v1/Flashcard/${id}`);
  }

  async updateReviewStatus(id: string, data: { wasCorrect: boolean }) {
    return this.request(`/api/v1/Flashcard/${id}/review`, {
      method: "PUT",
      params: { wasCorrect: data.wasCorrect },
    });
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
