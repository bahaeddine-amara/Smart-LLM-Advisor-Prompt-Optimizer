package com.smartllm.advisor.service;

import com.smartllm.advisor.dto.OptimizeResponse;
import com.smartllm.advisor.llm.OllamaClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class OptimizationService {

    @Autowired private OllamaClient ollamaClient;
    @Autowired private CostEstimationService costEstimationService;
    @Autowired private TokenEstimationService tokenEstimationService;

    public OptimizeResponse optimize(String originalPrompt, String mode) {
        int tokensBefore = tokenEstimationService.estimateBaseTokens(originalPrompt);

        String optimizedPrompt = ollamaClient.optimize(originalPrompt, mode);
        int tokensAfter = tokenEstimationService.estimateBaseTokens(optimizedPrompt);

        double savingsPercent = tokensBefore > 0
                ? Math.round(((double)(tokensBefore - tokensAfter) / tokensBefore) * 10000.0) / 100.0
                : 0;

        Map<String, Double> costsBefore = costEstimationService.calculateCosts(tokensBefore);
        Map<String, Double> costsAfter  = costEstimationService.calculateCosts(tokensAfter);

        double costBefore = costsBefore.getOrDefault("GPT-5", 0.0);
        double costAfter  = costsAfter.getOrDefault("GPT-5", 0.0);

        return OptimizeResponse.builder()
                .optimizedPrompt(optimizedPrompt)
                .tokensBefore(tokensBefore)
                .tokensAfter(tokensAfter)
                .savingsPercent(savingsPercent)
                .costBefore(costBefore)
                .costAfter(costAfter)
                .build();
    }
}
