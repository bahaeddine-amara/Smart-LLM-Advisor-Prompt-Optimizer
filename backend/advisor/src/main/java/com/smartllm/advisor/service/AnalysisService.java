package com.smartllm.advisor.service;

import com.smartllm.advisor.dto.AnalyzeResponse;
import com.smartllm.advisor.llm.OllamaAnalysisResult;
import com.smartllm.advisor.llm.OllamaClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AnalysisService {

    @Autowired private OllamaClient ollamaClient;
    @Autowired private CostEstimationService costEstimationService;
    @Autowired private RecommendationService recommendationService;
    @Autowired private TokenEstimationService tokenEstimationService;

    public AnalyzeResponse analyze(String prompt) {
        // 1. LLM call — only asks for category + qualityScore
        OllamaAnalysisResult result = ollamaClient.analyze(prompt);

        // 2. Compute token counts per model locally (accurate, not LLM-guessed)
        Map<String, Integer> tokensByModel = costEstimationService.calculateTokensByModel(prompt);

        // 3. Compute costs per model using each model's own token count
        Map<String, Double> costEstimates = costEstimationService.calculateCosts(prompt);

        // 4. Base token count for the UI headline (GPT cl100k reference)
        int baseTokens = tokenEstimationService.estimateBaseTokens(prompt);

        // 5. Get model recommendations
        Map<String, String> recommendations = recommendationService.recommend(
                result.getCategory(), costEstimates);

        return AnalyzeResponse.builder()
                .category(result.getCategory())
                .qualityScore(result.getQualityScore())
                .estimatedTokens(baseTokens)
                .tokensByModel(tokensByModel)
                .costEstimates(costEstimates)
                .recommendations(recommendations)
                .build();
    }
}
