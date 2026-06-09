package com.smartllm.advisor.service;

import com.smartllm.advisor.dto.OptimizeResponse;
import com.smartllm.advisor.llm.DeepSeekClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class OptimizationService {

    @Autowired private DeepSeekClient deepSeekClient;
    @Autowired private CostEstimationService costEstimationService;

    public OptimizeResponse optimize(String originalPrompt, String mode) {
        // Estimate original tokens (rough: words * 1.3)
        int tokensBefore = estimateTokens(originalPrompt);

        // Call DeepSeek to rewrite
        String optimizedPrompt = deepSeekClient.optimize(originalPrompt, mode);
        int tokensAfter = estimateTokens(optimizedPrompt);

        // Calculate savings
        double savingsPercent = tokensBefore > 0
                ? Math.round(((double)(tokensBefore - tokensAfter) / tokensBefore) * 10000.0) / 100.0
                : 0;

        // Calculate costs using cheapest model (DeepSeek Chat) as reference
        Map<String, Double> costsBefore = costEstimationService.calculateCosts(tokensBefore);
        Map<String, Double> costsAfter = costEstimationService.calculateCosts(tokensAfter);

        // Use GPT-5 as reference cost (most common/representative)
        double costBefore = costsBefore.getOrDefault("GPT-5", 0.0);
        double costAfter = costsAfter.getOrDefault("GPT-5", 0.0);

        return OptimizeResponse.builder()
                .optimizedPrompt(optimizedPrompt)
                .tokensBefore(tokensBefore)
                .tokensAfter(tokensAfter)
                .savingsPercent(savingsPercent)
                .costBefore(costBefore)
                .costAfter(costAfter)
                .build();
    }

    // Simple token estimator: words * 1.3 (rough approximation)
    private int estimateTokens(String text) {
        if (text == null || text.isBlank()) return 0;
        String[] words = text.trim().split("\\s+");
        return (int) Math.ceil(words.length * 1.3);
    }
}