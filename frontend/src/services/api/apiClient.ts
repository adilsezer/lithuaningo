import axios, { AxiosInstance, AxiosError } from "axios";
import { Platform } from "react-native";
import { supabase } from "../../services/supabase/supabaseClient";
import { useUserStore } from "../../stores/useUserStore";
import Constants from "expo-constants";
import { AppInfoResponse } from "@src/types/AppInfo";
import {
  LeaderboardEntryResponse,
  UpdateLeaderboardEntryRequest,
} from "@src/types/Leaderboard";
import { ChallengeQuestionResponse } from "@src/types/ChallengeQuestion";
import { FlashcardRequest, FlashcardResponse } from "@src/types/Flashcard";
import {
  SubmitFlashcardAnswerRequest,
  UserFlashcardStatResponse,
  UserFlashcardStatsSummaryResponse,
} from "@src/types/UserFlashcardStats";
import {
  SubmitChallengeAnswerRequest,
  UserChallengeStatsResponse,
} from "@src/types/UserChallengeStats";
import {
  UserProfileResponse,
  UpdateUserProfileRequest,
} from "@src/types/UserProfile";
import { AIRequest, AIResponse } from "@src/types/AI";

// Get the app version from Expo constants
const APP_VERSION = Constants.expoConfig?.version || "1.0.0";

// API URL from environment variables
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:7016";

/**
 * Custom API error class to handle API errors with status and data
 */
export class ApiError extends Error {
  constructor(public status: number, public data: any, message?: string) {
    super(message || "API Error");
    this.name = "ApiError";
  }
}

/**
 * Get the base URL for API requests, handling Android emulator localhost
 */
const getBaseUrl = () => {
  if (__DEV__ && Platform.OS === "android") {
    // Replace localhost with 10.0.2.2 for Android emulator
    return API_URL.replace("localhost", "10.0.2.2");
  }
  return API_URL;
};

/**
 * API Client for managing HTTP requests
 */
class ApiClient {
  private static instance: ApiClient;
  private axiosInstance: AxiosInstance;
  private baseURL: string;

  private constructor() {
    this.baseURL = getBaseUrl();
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 60000, // 60 seconds
      headers: {
        "Content-Type": "application/json",
        "X-Platform": Platform.OS,
        "X-App-Version": APP_VERSION,
      },
    });

    this.setupInterceptors();
  }

  /**
   * Get singleton instance of ApiClient
   */
  static getInstance(): ApiClient {
    if (!this.instance) {
      this.instance = new ApiClient();
    }
    return this.instance;
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors() {
    // Request interceptor for adding auth token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          const token = session?.access_token;

          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error(
            "[ApiClient] Auth error in request interceptor:",
            error
          );
        }
        return config;
      },
      (error) => {
        console.error("[ApiClient] Request interceptor error:", error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Log API errors
        this.logApiError(error);

        // Handle unauthorized errors (401)
        if (error.response?.status === 401) {
          try {
            console.warn("[ApiClient] Unauthorized request, signing out user");
            const { setAuthenticated } = useUserStore.getState();
            await supabase.auth.signOut();
            setAuthenticated(false);
          } catch (signOutError) {
            console.error("[ApiClient] Error during sign out:", signOutError);
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Log API errors with detailed information
   */
  private logApiError(error: AxiosError) {
    console.error("[ApiClient] Response error:", {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      data: error.response?.data,
    });
  }

  /**
   * Convert Axios errors to ApiError instances
   */
  private handleError(error: any): ApiError | Error {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;
      const message = data?.message || `Error ${status}: Server error occurred`;
      return new ApiError(status, data, message);
    } else if (error.request) {
      // Request made but no response received
      return new Error("Network error: No response from server");
    } else {
      // Something else happened while setting up the request
      return error instanceof Error ? error : new Error(String(error));
    }
  }

  /**
   * Make a GET request
   */
  async get<T>(
    endpoint: string,
    params?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", params, ...options });
  }

  /**
   * Make a POST request
   */
  async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "POST", data, ...options });
  }

  /**
   * Make a PUT request
   */
  async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "PUT", data, ...options });
  }

  /**
   * Make a PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "PATCH", data, ...options });
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(
    endpoint: string,
    params?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE", params, ...options });
  }

  /**
   * Base method to make HTTP requests
   */
  private async request<T>(
    endpoint: string,
    options?: {
      method?: string;
      data?: any;
      params?: any;
      headers?: Record<string, string>;
      timeout?: number;
    }
  ): Promise<T> {
    const requestId = `req_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;
    const method = options?.method || "GET";

    try {
      const response = await this.axiosInstance({
        url: endpoint,
        method,
        data: options?.data,
        params: options?.params,
        headers: options?.headers,
        timeout: options?.timeout || this.axiosInstance.defaults.timeout,
      });

      console.log(`[API] [${requestId}] COMPLETE ${method} ${endpoint}`);
      return response.data;
    } catch (error) {
      console.log(`[API] [${requestId}] ERROR ${method} ${endpoint}`);
      throw this.handleError(error);
    }
  }

  // App Info Controller
  async getAppInfo(platform: string = Platform.OS): Promise<AppInfoResponse> {
    try {
      const response = await this.request<AppInfoResponse>(
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

  // AI API methods
  async processAIRequest(
    prompt: string,
    serviceType: string = "chat",
    context?: Record<string, string>
  ): Promise<string> {
    const request: AIRequest = {
      prompt,
      serviceType,
      context,
    };

    const response = await this.request<AIResponse>(`/api/v1/ai/process`, {
      method: "POST",
      data: request,
    });
    return response.response;
  }

  async sendChatMessage(
    message: string,
    context?: Record<string, string>
  ): Promise<string> {
    const request: AIRequest = {
      prompt: message,
      serviceType: "chat",
      context,
    };

    const response = await this.request<AIResponse>(`/api/v1/ai/chat`, {
      method: "POST",
      data: request,
    });
    return response.response;
  }

  // User Challenge Stats Controller
  async getUserChallengeStats(
    userId: string
  ): Promise<UserChallengeStatsResponse> {
    return this.request<UserChallengeStatsResponse>(
      `/api/v1/UserChallengeStats/${userId}/stats`,
      {
        method: "GET",
      }
    );
  }

  async submitChallengeAnswer(
    request: SubmitChallengeAnswerRequest
  ): Promise<UserChallengeStatsResponse> {
    return this.request<UserChallengeStatsResponse>(
      `/api/v1/UserChallengeStats/submit-answer`,
      {
        method: "POST",
        data: request,
      }
    );
  }

  // Leaderboard Controller
  async getCurrentWeekLeaderboard(): Promise<LeaderboardEntryResponse[]> {
    return this.request<LeaderboardEntryResponse[]>(
      `/api/v1/Leaderboard/current`,
      {
        method: "GET",
      }
    );
  }

  async updateLeaderboardEntry(
    request: UpdateLeaderboardEntryRequest
  ): Promise<LeaderboardEntryResponse> {
    return this.request<LeaderboardEntryResponse>(`/api/v1/Leaderboard/entry`, {
      method: "POST",
      data: request,
    });
  }

  // Challenge Controller
  async getDailyChallengeQuestions(): Promise<ChallengeQuestionResponse[]> {
    return this.request<ChallengeQuestionResponse[]>(
      `/api/v1/Challenge/daily`,
      {
        method: "GET",
      }
    );
  }

  // Flashcard Controller
  async getFlashcards(request: FlashcardRequest): Promise<FlashcardResponse[]> {
    return this.request<FlashcardResponse[]>(`/api/v1/Flashcard/learning`, {
      method: "GET",
      params: request,
    });
  }

  // User Flashcard Stats Controller
  async getUserFlashcardStatsSummary(
    userId: string
  ): Promise<UserFlashcardStatsSummaryResponse> {
    return this.request<UserFlashcardStatsSummaryResponse>(
      `/api/v1/UserFlashcardStats/${userId}/summary-stats`,
      {
        method: "GET",
      }
    );
  }

  async submitFlashcardAnswer(
    request: SubmitFlashcardAnswerRequest
  ): Promise<UserFlashcardStatResponse> {
    return this.request<UserFlashcardStatResponse>(
      `/api/v1/UserFlashcardStats/submit-answer`,
      {
        method: "POST",
        data: request,
      }
    );
  }

  // User Profile Controller
  async getUserProfile(userId: string): Promise<UserProfileResponse> {
    return this.request<UserProfileResponse>(`/api/v1/UserProfile/${userId}`);
  }

  async updateUserProfile(
    userId: string,
    profile: UpdateUserProfileRequest
  ): Promise<UserProfileResponse> {
    return this.request<UserProfileResponse>(`/api/v1/UserProfile/${userId}`, {
      method: "PUT",
      data: profile,
    });
  }

  async deleteUserProfile(userId: string): Promise<void> {
    await this.request<void>(`/api/v1/UserProfile/${userId}`, {
      method: "DELETE",
    });
  }

  /**
   * Fetches statistics for a single flashcard for a specific user
   * @param userId The ID of the user
   * @param flashcardId The ID of the flashcard
   * @returns Promise<UserFlashcardStatResponse>
   */
  async getFlashcardStats(
    userId: string,
    flashcardId: string
  ): Promise<UserFlashcardStatResponse> {
    return this.request<UserFlashcardStatResponse>(
      `/api/v1/UserFlashcardStats/${userId}/flashcard/${flashcardId}`,
      {
        method: "GET",
      }
    );
  }
}

// Request options type
export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
}

// Export a singleton instance
export const apiClient = ApiClient.getInstance();
