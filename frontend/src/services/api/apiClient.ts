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
  Deck,
  Flashcard,
  Comment,
  QuizResult,
  PracticeProgress,
  PracticeStats,
  Report,
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

  async getDecks(category?: string, query?: string) {
    return this.request<Deck[]>("/deck", {
      params: { category, query },
    });
  }

  async getDeckById(id: string) {
    return this.request<Deck>(`/deck/${id}`);
  }

  async getUserDecks(userId: string) {
    return this.request<Deck[]>(`/deck/user/${userId}`);
  }

  async createDeck(deck: Deck) {
    return this.request<string>("/deck", {
      method: "POST",
      data: deck,
    });
  }

  async updateDeck(id: string, deck: Deck) {
    return this.request<void>(`/deck/${id}`, {
      method: "PUT",
      data: deck,
    });
  }

  async deleteDeck(id: string) {
    return this.request<void>(`/deck/${id}`, {
      method: "DELETE",
    });
  }

  async voteDeck(id: string, userId: string, isUpvote: boolean) {
    return this.request<boolean>(`/deck/${id}/vote`, {
      method: "POST",
      params: { userId, isUpvote },
    });
  }

  async reportDeck(id: string, userId: string, reason: string) {
    return this.request<void>(`/deck/${id}/report`, {
      method: "POST",
      data: { userId, reason },
    });
  }

  async searchDecks(query: string, category?: string) {
    return this.request<Deck[]>("/deck/search", {
      params: { query, category },
    });
  }

  async getTopRatedDecks(
    limit: number = 10,
    timeRange: "week" | "month" | "all" = "all"
  ) {
    return this.request<Deck[]>(`/deck/top-rated`, {
      params: { limit, timeRange },
    });
  }

  async getDeckFlashcards(deckId: string) {
    return this.request<Flashcard[]>(`/deck/${deckId}/flashcards`);
  }

  async addFlashcardToDeck(deckId: string, flashcard: Flashcard) {
    return this.request<string>(`/deck/${deckId}/flashcards`, {
      method: "POST",
      data: flashcard,
    });
  }

  async removeFlashcardFromDeck(deckId: string, flashcardId: string) {
    return this.request(`/deck/${deckId}/flashcards/${flashcardId}`, {
      method: "DELETE",
    });
  }

  async getDeckRating(id: string) {
    return this.request<number>(`/deck/${id}/rating`);
  }

  async getFlashcardById(id: string) {
    return this.request<Flashcard>(`/flashcard/${id}`);
  }

  async getUserFlashcards(userId: string) {
    return this.request<Flashcard[]>(`/flashcard/user/${userId}`);
  }

  async createFlashcard(flashcard: Omit<Flashcard, "id" | "createdAt">) {
    return this.request<string>("/flashcard", {
      method: "POST",
      data: flashcard,
    });
  }

  async updateFlashcard(id: string, flashcard: Flashcard) {
    return this.request(`/flashcard/${id}`, {
      method: "PUT",
      data: flashcard,
    });
  }

  async deleteFlashcard(id: string) {
    return this.request(`/flashcard/${id}`, {
      method: "DELETE",
    });
  }

  async getDueForReview(userId: string, limit: number = 20) {
    return this.request<Flashcard[]>(`/flashcard/due-for-review`, {
      params: { userId, limit },
    });
  }

  async updateReviewStatus(id: string, wasCorrect: boolean) {
    return this.request(`/flashcard/${id}/review`, {
      method: "POST",
      params: { wasCorrect },
    });
  }

  async getRandomFlashcards(limit: number = 10) {
    return this.request<Flashcard[]>(`/flashcard/random`, {
      params: { limit },
    });
  }

  async searchFlashcards(query: string) {
    return this.request<Flashcard[]>(`/flashcard/search`, {
      params: { query },
    });
  }

  async getDeckComments(deckId: string) {
    return this.request<Comment[]>(`/comment/deck/${deckId}`);
  }

  async addDeckComment(
    comment: Pick<Comment, "deckId" | "content" | "createdBy" | "userId">
  ) {
    console.log("comment", comment);
    if (
      !comment.deckId ||
      !comment.content ||
      !comment.createdBy ||
      !comment.userId
    ) {
      throw new ApiError(
        400,
        { message: "Missing required fields" },
        "Invalid comment data"
      );
    }

    return this.request<string>("/comment", {
      method: "POST",
      data: {
        deckId: comment.deckId,
        content: comment.content,
        createdBy: comment.createdBy,
        userId: comment.userId,
      },
      params: { userId: comment.userId },
    });
  }

  async deleteDeckComment(commentId: string, userId: string) {
    if (!commentId || !userId) {
      throw new ApiError(
        400,
        { message: "Comment ID and User ID are required" },
        "Invalid parameters"
      );
    }

    return this.request<void>(`/comment/${commentId}`, {
      method: "DELETE",
      params: { userId },
    });
  }

  async likeDeckComment(commentId: string, userId: string) {
    if (!commentId || !userId) {
      throw new ApiError(
        400,
        { message: "Comment ID and User ID are required" },
        "Invalid parameters"
      );
    }

    return this.request<boolean>(`/comment/${commentId}/like`, {
      method: "POST",
      params: { userId },
    });
  }

  async unlikeDeckComment(commentId: string, userId: string) {
    if (!commentId || !userId) {
      throw new ApiError(
        400,
        { message: "Comment ID and User ID are required" },
        "Invalid parameters"
      );
    }

    return this.request<boolean>(`/comment/${commentId}/unlike`, {
      method: "POST",
      params: { userId },
    });
  }

  async startDeckQuiz(deckId: string) {
    return this.request<QuizQuestion[]>(`/deck/${deckId}/quiz/start`);
  }

  async submitDeckQuizResult(result: Omit<QuizResult, "completedAt">) {
    return this.request<void>(`/deck/${result.deckId}/quiz/submit`, {
      method: "POST",
      data: result,
    });
  }

  async getDeckQuizHistory(userId: string) {
    return this.request<QuizResult[]>(`/user/${userId}/quiz-history`);
  }

  async trackPracticeProgress(progress: Omit<PracticeProgress, "timestamp">) {
    return this.request<void>(`/deck/${progress.deckId}/practice/track`, {
      method: "POST",
      params: {
        userId: progress.userId,
        flashcardId: progress.flashcardId,
        isCorrect: progress.isCorrect,
      },
    });
  }

  async getPracticeStats(deckId: string, userId: string) {
    return this.request<PracticeStats>(`/deck/${deckId}/practice/stats`, {
      params: { userId },
    });
  }

  async getPracticeHistory(userId: string) {
    return this.request<PracticeStats[]>(
      `/deck/user/${userId}/practice-history`
    );
  }

  async uploadFlashcardFile(formData: FormData) {
    return this.request<string>("/flashcard/upload", {
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data: formData,
    });
  }

  async createReport(report: Partial<Report>) {
    return this.request<string>("/report", {
      method: "POST",
      data: {
        ...report,
        contentType: "deck",
        contentId: report.contentId,
        status: "pending",
      },
    });
  }

  async getReports(status: Report["status"] = "pending", limit: number = 50) {
    return this.request<Report[]>("/report", {
      params: { status, limit },
    });
  }

  async getReport(id: string) {
    return this.request<Report>(`/report/${id}`);
  }

  async getContentReports(contentType: string, contentId: string) {
    return this.request<Report[]>(
      `/report/content/${contentType}/${contentId}`
    );
  }

  async updateReportStatus(
    id: string,
    status: Report["status"],
    reviewedBy: string,
    resolution?: string
  ) {
    return this.request<void>(`/report/${id}/status`, {
      method: "PUT",
      data: {
        status,
        reviewedBy,
        resolution,
        reviewedAt: new Date().toISOString(),
      },
    });
  }
}

export default ApiClient.getInstance();
