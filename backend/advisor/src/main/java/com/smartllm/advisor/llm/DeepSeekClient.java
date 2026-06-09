package com.smartllm.advisor.llm;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class DeepSeekClient {

    @Value("${deepseek.api.key}")
    private String apiKey;

    @Value("${deepseek.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ───────────────────────────────────────────────
    // ANALYZE: returns category, qualityScore, estimatedTokens
    // ───────────────────────────────────────────────
    public DeepSeekAnalysisResult analyze(String userPrompt) {
        String systemContent =
            "You are an expert prompt analyzer. Return a JSON object with exactly three fields: " +
            "category (one of: Programming, Writing, Research, General), " +
            "qualityScore (integer 0-100 based on clarity, specificity, structure), " +
            "estimatedTokens (integer count of tokens in the prompt). " +
            "Return ONLY the JSON object, no other text, no markdown.";

        String content = callDeepSeek(systemContent, userPrompt, 0.0);

        // Strip any markdown fences if present
        content = content.trim();
        if (content.startsWith("```")) {
            content = content.replaceAll("```json", "").replaceAll("```", "").trim();
        }

        try {
            return objectMapper.readValue(content, DeepSeekAnalysisResult.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse DeepSeek analysis response: " + content, e);
        }
    }

    // ───────────────────────────────────────────────
    // OPTIMIZE: rewrites the prompt
    // ───────────────────────────────────────────────
    public String optimize(String originalPrompt, String mode) {
        String systemContent;
        if ("ECONOMY".equalsIgnoreCase(mode)) {
            systemContent =
                "Compress the prompt as much as possible to use the fewest tokens, " +
                "while preserving the core instruction. Return only the rewritten prompt, no explanations.";
        } else {
            systemContent =
                "Rewrite the prompt to be more precise and effective while keeping the same intent. " +
                "Minimize token usage without losing clarity. Return only the rewritten prompt, no explanations.";
        }

        return callDeepSeek(systemContent, originalPrompt, 0.3);
    }

    // ───────────────────────────────────────────────
    // Internal helper
    // ───────────────────────────────────────────────
    @SuppressWarnings("unchecked")
    private String callDeepSeek(String systemContent, String userContent, double temperature) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "deepseek-chat");
        requestBody.put("temperature", temperature);

        List<Map<String, String>> messages = new ArrayList<>();

        Map<String, String> systemMsg = new HashMap<>();
        systemMsg.put("role", "system");
        systemMsg.put("content", systemContent);
        messages.add(systemMsg);

        Map<String, String> userMsg = new HashMap<>();
        userMsg.put("role", "user");
        userMsg.put("content", userContent);
        messages.add(userMsg);

        requestBody.put("messages", messages);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, entity, Map.class);

        Map<?, ?> body = response.getBody();
        if (body == null) throw new RuntimeException("Empty response from DeepSeek");

        List<Map<?, ?>> choices = (List<Map<?, ?>>) body.get("choices");
        Map<?, ?> firstChoice = choices.get(0);
        Map<?, ?> message = (Map<?, ?>) firstChoice.get("message");
        return (String) message.get("content");
    }
}