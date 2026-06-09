package com.smartllm.advisor.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartllm.advisor.dto.ScoreDetailResponse;
import com.smartllm.advisor.llm.OllamaClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ScoreDetailService {

    @Autowired private OllamaClient ollamaClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ScoreDetailResponse getDetailedScore(String prompt) {
        String json = ollamaClient.scoreDetail(prompt);

        try {
            JsonNode node = objectMapper.readTree(json);

            int clarity       = clamp(node.path("clarity").asInt(50));
            int specificity   = clamp(node.path("specificity").asInt(50));
            int context       = clamp(node.path("context").asInt(50));
            int actionability = clamp(node.path("actionability").asInt(50));
            int conciseness   = clamp(node.path("conciseness").asInt(50));
            String suggestion = node.path("suggestion").asText("Add more context and specific constraints.");

            // Weighted composite: actionability + specificity matter most
            int overall = (int) Math.round(
                clarity       * 0.20 +
                specificity   * 0.25 +
                context       * 0.20 +
                actionability * 0.25 +
                conciseness   * 0.10
            );

            return ScoreDetailResponse.builder()
                    .clarity(clarity)
                    .specificity(specificity)
                    .context(context)
                    .actionability(actionability)
                    .conciseness(conciseness)
                    .overall(overall)
                    .suggestion(suggestion)
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Failed to parse score detail response: " + json, e);
        }
    }

    private int clamp(int val) {
        return Math.max(0, Math.min(100, val));
    }
}
