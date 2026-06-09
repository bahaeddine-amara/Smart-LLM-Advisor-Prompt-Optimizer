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

    // Output tokens are estimated as 50% of input tokens
    private static final double OUTPUT_RATIO = 0.5;

    @Autowired
    private AIModelRepository aiModelRepository;

    public Map<String, Double> calculateCosts(int inputTokens) {
        List<AIModel> models = aiModelRepository.findAll();
        Map<String, Double> costs = new LinkedHashMap<>();

        int estimatedOutputTokens = (int) (inputTokens * OUTPUT_RATIO);

        for (AIModel model : models) {
            double cost = (inputTokens * model.getInputPrice().doubleValue()
                    + estimatedOutputTokens * model.getOutputPrice().doubleValue())
                    / 1_000_000.0;
            costs.put(model.getModelName(), Math.round(cost * 1_000_000.0) / 1_000_000.0);
        }
        return costs;
    }
}