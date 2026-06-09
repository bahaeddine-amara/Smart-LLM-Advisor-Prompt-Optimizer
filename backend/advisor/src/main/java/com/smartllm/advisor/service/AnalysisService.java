package com.smartllm.advisor.service;

import com.smartllm.advisor.dto.AnalyzeResponse;
import com.smartllm.advisor.llm.DeepSeekAnalysisResult;
import com.smartllm.advisor.llm.DeepSeekClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AnalysisService {

    @Autowired private DeepSeekClient deepSeekClient;
    @Autowired private CostEstimationService costEstimationService;
    @Autowired private RecommendationService recommendationService;

    public AnalyzeResponse analyze(String prompt) {
        // 1. Single call to DeepSeek
        DeepSeekAnalysisResult result = deepSeekClient.analyze(prompt);

        // 2. Calculate costs for each model
        Map<String, Double> costEstimates = costEstimationService.calculateCosts(result.getEstimatedTokens());

        // 3. Get recommendations
        Map<String, String> recommendations = recommendationService.recommend(
                result.getCategory(), costEstimates);

        // 4. Build and return response
        return AnalyzeResponse.builder()
                .category(result.getCategory())
                .qualityScore(result.getQualityScore())
                .estimatedTokens(result.getEstimatedTokens())
                .costEstimates(costEstimates)
                .recommendations(recommendations)
                .build();
    }
}