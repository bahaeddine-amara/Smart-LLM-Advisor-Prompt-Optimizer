package com.smartllm.advisor.service;

import com.smartllm.advisor.entity.AIModel;
import com.smartllm.advisor.repository.AIModelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class RecommendationService {

    @Autowired
    private AIModelRepository aiModelRepository;

    public Map<String, String> recommend(String category, Map<String, Double> costs) {
        List<AIModel> models = aiModelRepository.findAll();

        AIModel bestOverall = null;
        double bestScore = -1;

        AIModel bestValue = null;
        double bestValueRatio = -1;

        AIModel cheapest = null;
        double lowestCost = Double.MAX_VALUE;

        for (AIModel model : models) {
            double score = getWeightedScore(model, category);
            Double cost = costs.getOrDefault(model.getModelName(), Double.MAX_VALUE);

            // Best overall
            if (score > bestScore) {
                bestScore = score;
                bestOverall = model;
            }

            // Best value (score / cost ratio)
            if (cost > 0) {
                double ratio = score / cost;
                if (ratio > bestValueRatio) {
                    bestValueRatio = ratio;
                    bestValue = model;
                }
            }

            // Cheapest
            if (cost < lowestCost) {
                lowestCost = cost;
                cheapest = model;
            }
        }

        Map<String, String> result = new HashMap<>();
        result.put("bestOverall", bestOverall != null ? bestOverall.getModelName() : "N/A");
        result.put("bestValue", bestValue != null ? bestValue.getModelName() : "N/A");
        result.put("cheapest", cheapest != null ? cheapest.getModelName() : "N/A");
        return result;
    }

    private double getWeightedScore(AIModel model, String category) {
        return switch (category) {
            case "Programming" ->
                model.getCodingScore().doubleValue() * 0.7
                + model.getOverallScore().doubleValue() * 0.3;
            case "Writing" ->
                model.getWritingScore().doubleValue() * 0.7
                + model.getOverallScore().doubleValue() * 0.3;
            case "Research" ->
                model.getResearchScore().doubleValue() * 0.7
                + model.getOverallScore().doubleValue() * 0.3;
            default ->
                model.getOverallScore().doubleValue();
        };
    }
}