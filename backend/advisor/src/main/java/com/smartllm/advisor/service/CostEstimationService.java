package com.smartllm.advisor.service;

import com.smartllm.advisor.entity.AIModel;
import com.smartllm.advisor.repository.AIModelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class CostEstimationService {

    /**
     * Output tokens are typically ~40-60% of input for prompt analysis tasks.
     * Using 0.5 as a conservative middle estimate.
     */
    private static final double OUTPUT_RATIO = 0.5;

    @Autowired private AIModelRepository aiModelRepository;
    @Autowired private TokenEstimationService tokenEstimationService;

    /**
     * Returns per-model token counts. Each model has a different tokenizer
     * so the same text produces different token counts.
     */
    public Map<String, Integer> calculateTokensByModel(String promptText) {
        List<AIModel> models = aiModelRepository.findAll();
        Map<String, Integer> tokens = new LinkedHashMap<>();
        for (AIModel model : models) {
            tokens.put(model.getModelName(),
                tokenEstimationService.estimateTokensForModel(promptText, model.getModelName()));
        }
        return tokens;
    }

    /**
     * Calculates cost per model based on that model's specific token count.
     * This is the key fix: each model now uses its own token count, not a shared one.
     */
    public Map<String, Double> calculateCosts(String promptText) {
        List<AIModel> models = aiModelRepository.findAll();
        Map<String, Double> costs = new LinkedHashMap<>();

        for (AIModel model : models) {
            int inputTokens = tokenEstimationService.estimateTokensForModel(promptText, model.getModelName());
            int estimatedOutputTokens = (int) (inputTokens * OUTPUT_RATIO);

            double cost = (inputTokens  * model.getInputPrice().doubleValue()
                        + estimatedOutputTokens * model.getOutputPrice().doubleValue())
                        / 1_000_000.0;

            // Round to 8 decimal places for meaningful display
            costs.put(model.getModelName(), Math.round(cost * 100_000_000.0) / 100_000_000.0);
        }
        return costs;
    }

    /**
     * Legacy overload: computes costs from a pre-computed token count (used by OptimizationService).
     */
    public Map<String, Double> calculateCosts(int inputTokens) {
        List<AIModel> models = aiModelRepository.findAll();
        Map<String, Double> costs = new LinkedHashMap<>();
        int estimatedOutputTokens = (int) (inputTokens * OUTPUT_RATIO);

        for (AIModel model : models) {
            double cost = (inputTokens  * model.getInputPrice().doubleValue()
                        + estimatedOutputTokens * model.getOutputPrice().doubleValue())
                        / 1_000_000.0;
            costs.put(model.getModelName(), Math.round(cost * 100_000_000.0) / 100_000_000.0);
        }
        return costs;
    }
}
