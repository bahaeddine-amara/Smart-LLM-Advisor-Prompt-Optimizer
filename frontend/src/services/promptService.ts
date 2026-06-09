import axiosInstance from '../lib/axiosInstance';

const LLM_TIMEOUT_MS = 5 * 60 * 1000; // 5 min for LLM calls

// ── Response types ────────────────────────────────────────────────────────────

export interface AnalyzeResponse {
  category: string;
  qualityScore: number;
  estimatedTokens: number;
  tokensByModel: Record<string, number>;
  costEstimates: Record<string, number>;
  recommendations: {
    bestOverall: string;
    bestValue: string;
    cheapest: string;
  };
}

export interface ScoreDetailResponse {
  clarity: number;
  specificity: number;
  context: number;
  actionability: number;
  conciseness: number;
  overall: number;
  suggestion: string;
}

export interface OptimizeResponse {
  optimizedPrompt: string;
  tokensBefore: number;
  tokensAfter: number;
  savingsPercent: number;
  costBefore: number;
  costAfter: number;
}

export interface AbTestResponse {
  promptA: string;
  outputA: string;
  tokensA: number;
  qualityA: number;
  promptB: string;
  outputB: string;
  tokensB: number;
  qualityB: number;
  winner: 'A' | 'B' | 'TIE';
  verdict: string;
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
  categoryBreakdown: Record<string, number>;
}

export interface TemplateDto {
  id: string;
  title: string;
  category: string;
  description: string;
  prompt: string;
  tags: string[];
}

// ── Service ───────────────────────────────────────────────────────────────────

export const promptService = {
  analyze: (prompt: string): Promise<{ data: AnalyzeResponse }> =>
    axiosInstance.post('/prompts/analyze', { prompt }, { timeout: LLM_TIMEOUT_MS }),

  scoreDetail: (prompt: string): Promise<{ data: ScoreDetailResponse }> =>
    axiosInstance.post('/prompts/score-detail', { prompt }, { timeout: LLM_TIMEOUT_MS }),

  optimize: (originalPrompt: string, mode: string): Promise<{ data: OptimizeResponse }> =>
    axiosInstance.post('/prompts/optimize', { originalPrompt, mode }, { timeout: LLM_TIMEOUT_MS }),

  abTest: (promptA: string, promptB: string): Promise<{ data: AbTestResponse }> =>
    axiosInstance.post('/prompts/ab-test', { promptA, promptB }, { timeout: LLM_TIMEOUT_MS }),

  save: (data: object) =>
    axiosInstance.post('/prompts', data),

  getHistory: (page = 0, size = 10, category?: string, search?: string) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (category) params.set('category', category);
    if (search)   params.set('search', search);
    return axiosInstance.get(`/prompts?${params}`);
  },

  delete: (id: number) =>
    axiosInstance.delete(`/prompts/${id}`),

  getStats: (): Promise<{ data: StatisticsDto }> =>
    axiosInstance.get('/prompts/stats'),

  getTemplates: (category?: string): Promise<{ data: TemplateDto[] }> => {
    const url = category ? `/prompts/templates?category=${encodeURIComponent(category)}` : '/prompts/templates';
    return axiosInstance.get(url);
  },
};
