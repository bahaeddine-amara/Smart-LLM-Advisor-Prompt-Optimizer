package com.smartllm.advisor.llm;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class OllamaClient {

    @Value("${ollama.api.url}")
    private String apiUrl;

    @Value("${ollama.model}")
    private String model;

    private final RestTemplate restTemplate = createRestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static RestTemplate createRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(15));
        factory.setReadTimeout(Duration.ofMinutes(5));
        return new RestTemplate(factory);
    }

    // ───────────────────────────────────────────────
    // ANALYZE: returns category and qualityScore only.
    // Token counting is done server-side in TokenEstimationService
    // (LLM token estimates are inaccurate and inconsistent).
    // ───────────────────────────────────────────────
    public OllamaAnalysisResult analyze(String userPrompt) {
        String systemContent =
            "You are an expert prompt classifier and quality evaluator. Analyze the user prompt and return a JSON object with exactly TWO fields.\n\n" +
            "FIELD 1 - category: Classify into EXACTLY one of these categories:\n" +
            "- \"Programming\" — code, software development, debugging, algorithms, APIs, web/mobile dev, system design\n" +
            "- \"Machine Learning\" — ML models, neural networks, training, datasets, AI/ML pipelines, predictions, data science, statistics, building predictive models\n" +
            "- \"DevOps\" — deployment, Docker, CI/CD, cloud infrastructure, servers, Kubernetes, monitoring\n" +
            "- \"Writing\" — essays, stories, emails, copywriting, content creation, grammar, creative writing\n" +
            "- \"Research\" — academic research, literature review, scientific questions, analysis of facts, non-technical investigation\n" +
            "- \"General\" — casual questions, advice, general knowledge, anything not fitting above\n\n" +
            "CLASSIFICATION RULES (apply in order, stop at first match):\n" +
            "1. If the prompt asks to BUILD, TRAIN, CREATE, or USE any ML/AI/predictive/classification model → \"Machine Learning\"\n" +
            "2. If the prompt involves writing code, fixing bugs, or software architecture → \"Programming\"\n" +
            "3. If the prompt is about deploying or managing infrastructure → \"DevOps\"\n" +
            "4. If the prompt asks to write text content → \"Writing\"\n" +
            "5. If the prompt asks to research or analyze factual information → \"Research\"\n" +
            "6. Otherwise → \"General\"\n\n" +
            "FIELD 2 - qualityScore: Integer 0-100 measuring how effective this prompt is for an AI:\n" +
            "90-100: Crystal clear, full context, specific constraints, immediately actionable\n" +
            "70-89:  Clear goal, reasonable context, mostly actionable\n" +
            "50-69:  Understandable but vague, missing some context\n" +
            "30-49:  Ambiguous goal, little context provided\n" +
            "0-29:   Very vague or unclear intent\n\n" +
            "Return ONLY valid JSON with exactly these two fields. No markdown fences, no explanation, no extra text.\n" +
            "Valid example: {\"category\":\"Machine Learning\",\"qualityScore\":65}";

        String content = callLlm(systemContent, userPrompt, 0.0);

        // Strip markdown fences if the model adds them despite instructions
        content = content.trim();
        if (content.startsWith("```")) {
            content = content.replaceAll("(?s)```[a-z]*\\n?", "").replaceAll("```", "").trim();
        }
        // Extract JSON if there's surrounding text
        int start = content.indexOf('{');
        int end   = content.lastIndexOf('}');
        if (start != -1 && end != -1 && end > start) {
            content = content.substring(start, end + 1);
        }

        try {
            return objectMapper.readValue(content, OllamaAnalysisResult.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse LLM analysis response: [" + content + "]", e);
        }
    }

    // ───────────────────────────────────────────────
    // SCORE DETAIL: returns 5-dimension breakdown
    // ───────────────────────────────────────────────
    public String scoreDetail(String userPrompt) {
        String systemContent =
            "You are a prompt quality evaluator. Score the following prompt on 5 dimensions, each from 0-100.\n\n" +
            "Return ONLY a JSON object with exactly these fields:\n" +
            "- clarity (0-100): Is the goal completely unambiguous?\n" +
            "- specificity (0-100): Are details, scope, and constraints clearly defined?\n" +
            "- context (0-100): Is enough background information provided?\n" +
            "- actionability (0-100): Can an AI act on this directly without asking follow-up questions?\n" +
            "- conciseness (0-100): Is it free of filler words and redundancy?\n" +
            "- suggestion (string): ONE specific, concrete improvement — max 20 words. Start with an action verb.\n\n" +
            "Return ONLY valid JSON. No markdown. No explanation outside the JSON.\n" +
            "Example: {\"clarity\":80,\"specificity\":60,\"context\":45,\"actionability\":75,\"conciseness\":90,\"suggestion\":\"Add the target programming language and expected output format.\"}";

        String content = callLlm(systemContent, userPrompt, 0.0);
        content = content.trim();
        if (content.startsWith("```")) {
            content = content.replaceAll("(?s)```[a-z]*\\n?", "").replaceAll("```", "").trim();
        }
        int start = content.indexOf('{');
        int end = content.lastIndexOf('}');
        if (start != -1 && end != -1 && end > start) {
            content = content.substring(start, end + 1);
        }
        return content;
    }

    // ───────────────────────────────────────────────
    // A/B TEST: run a prompt and return the output
    // ───────────────────────────────────────────────
    public String runPrompt(String userPrompt) {
        // Neutral system message — just execute the prompt as-is
        return callLlm(
            "You are a helpful AI assistant. Follow the user's instructions precisely.",
            userPrompt,
            0.7
        );
    }

    // ───────────────────────────────────────────────
    // OPTIMIZE: rewrites the prompt
    // ───────────────────────────────────────────────
    public String optimize(String originalPrompt, String mode) {
        String systemContent;
        if ("ECONOMY".equalsIgnoreCase(mode)) {
            systemContent =
                "Compress the following prompt to use the fewest possible tokens while preserving its core instruction and intent. " +
                "Remove filler words, redundancy, and unnecessary context. " +
                "Return ONLY the compressed prompt text, no explanations, no labels, no quotes.";
        } else {
            systemContent =
                "Rewrite the following prompt to be clearer, more specific, and more effective for an AI assistant. " +
                "Improve structure and reduce ambiguity while keeping the same intent. " +
                "Return ONLY the rewritten prompt text, no explanations, no labels, no quotes.";
        }

        return callLlm(systemContent, originalPrompt, 0.3);
    }

    // ───────────────────────────────────────────────
    // Internal HTTP helper
    // ───────────────────────────────────────────────
    @SuppressWarnings("unchecked")
    private String callLlm(String systemContent, String userContent, double temperature) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("temperature", temperature);
        requestBody.put("stream", false);

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemContent));
        messages.add(Map.of("role", "user",   "content", userContent));
        requestBody.put("messages", messages);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response;
        try {
            response = restTemplate.postForEntity(apiUrl, entity, Map.class);
        } catch (HttpStatusCodeException e) {
            throw new RuntimeException(
                "Ollama error (" + e.getStatusCode().value() + "): " + e.getResponseBodyAsString(), e);
        } catch (ResourceAccessException e) {
            throw new RuntimeException(
                "Cannot connect to Ollama at " + apiUrl +
                ". Make sure 'ollama serve' is running.", e);
        } catch (Exception e) {
            throw new RuntimeException("Unexpected Ollama error: " + e.getMessage(), e);
        }

        Map<?, ?> body = response.getBody();
        if (body == null) throw new RuntimeException("Empty response from Ollama");

        List<Map<?, ?>> choices = (List<Map<?, ?>>) body.get("choices");
        if (choices == null || choices.isEmpty()) throw new RuntimeException("No choices in Ollama response");
        Map<?, ?> message = (Map<?, ?>) choices.get(0).get("message");
        return (String) message.get("content");
    }
}
