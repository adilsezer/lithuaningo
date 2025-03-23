import axios, { AxiosInstance, AxiosError } from "axios";
import { Platform } from "react-native";
import { supabase } from "../../services/supabase/supabaseClient";
import { useUserStore } from "../../stores/useUserStore";
import Constants from "expo-constants";
import { UpdateAppInfoRequest, AppInfo } from "@src/types/AppInfo";
import { UpdateUserChallengeStatsRequest } from "@src/types/UserChallengeStats";
import { CreateUserChallengeStatsRequest } from "@src/types/UserChallengeStats";
import { UserChallengeStats } from "@src/types/UserChallengeStats";
import {
  LeaderboardEntry,
  UpdateLeaderboardEntryRequest,
} from "@src/types/Leaderboard";
import { ChallengeQuestion } from "@src/types/ChallengeQuestion";

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
      timeout: 15000, // 15 seconds
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

  // AI API methods
  async processAIRequest(
    prompt: string,
    serviceType: string = "chat",
    context?: Record<string, string>
  ): Promise<string> {
    const data = await this.request<{
      response: string;
      timestamp: string;
      serviceType: string;
    }>(`/api/v1/ai/process`, {
      method: "POST",
      data: {
        prompt,
        serviceType,
        context,
      },
    });
    return data.response;
  }

  async sendChatMessage(
    message: string,
    context?: Record<string, string>
  ): Promise<string> {
    return this.processAIRequest(message, "chat", context);
  }

  // User Challenge Stats Controller
  async getUserChallengeStats(userId: string): Promise<UserChallengeStats> {
    return this.request<UserChallengeStats>(
      `/api/v1/UserChallengeStats/${userId}/stats`
    );
  }

  async updateUserChallengeStats(
    userId: string,
    stats: UpdateUserChallengeStatsRequest
  ): Promise<void> {
    return this.request<void>(`/api/v1/UserChallengeStats/${userId}`, {
      method: "PUT",
      data: stats,
    });
  }

  async createUserChallengeStats(
    request: CreateUserChallengeStatsRequest
  ): Promise<UserChallengeStats> {
    return this.request<UserChallengeStats>(`/api/v1/UserChallengeStats`, {
      method: "POST",
      data: request,
    });
  }

  async updateDailyStreak(userId: string): Promise<void> {
    return this.request(`/api/v1/UserChallengeStats/${userId}/stats/streak`, {
      method: "POST",
    });
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
  // Challenge Controller
  async getDailyChallenge(): Promise<ChallengeQuestion[]> {
    return this.request<ChallengeQuestion[]>(`/api/v1/Challenge/daily`, {
      timeout: 120000,
    });
  }
}

// Request options type
export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
}

// Export a singleton instance
export const apiClient = ApiClient.getInstance();
