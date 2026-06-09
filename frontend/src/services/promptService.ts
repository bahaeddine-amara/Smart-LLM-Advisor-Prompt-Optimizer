import axiosInstance from '../lib/axiosInstance';

const LLM_TIMEOUT_MS = 5 * 60 * 1000;

export interface AnalyzeResponse {
  category: string;
  qualityScore: number;
  estimatedTokens: number;
  costEstimates: Record<string, number>;
  recommendations: {
    bestOverall: string;
    bestValue: string;
    cheapest: string;
  };
}

export interface OptimizeResponse {
  optimizedPrompt: string;
  tokensBefore: number;
  tokensAfter: number;
  savingsPercent: number;
  costBefore: number;
  costAfter: number;
}

export interface PromptDto {
  id: number;
  originalPrompt: string;
  optimizedPrompt?: string;
  category: string;
  qualityScore: number;
  tokensBefore?: number;
  tokensAfter?: number;
  costBefore?: number;
  costAfter?: number;
  recommendedModel?: string;
  optimizationMode?: string;
  createdAt: string;
}

export interface StatisticsDto {
  totalPrompts: number;
  totalTokensSaved: number;
  totalMoneySaved: number;
  averageQualityScore: number;
}

export const promptService = {
  analyze: (prompt: string): Promise<{ data: AnalyzeResponse }> =>
    axiosInstance.post('/prompts/analyze', { prompt }, { timeout: LLM_TIMEOUT_MS }),

  optimize: (originalPrompt: string, mode: string): Promise<{ data: OptimizeResponse }> =>
    axiosInstance.post('/prompts/optimize', { originalPrompt, mode }, { timeout: LLM_TIMEOUT_MS }),

  save: (data: object) =>
    axiosInstance.post('/prompts', data),

  getHistory: (page = 0, size = 10) =>
    axiosInstance.get(`/prompts?page=${page}&size=${size}`),

  delete: (id: number) =>
    axiosInstance.delete(`/prompts/${id}`),

  getStats: (): Promise<{ data: StatisticsDto }> =>
    axiosInstance.get('/prompts/stats'),
};
