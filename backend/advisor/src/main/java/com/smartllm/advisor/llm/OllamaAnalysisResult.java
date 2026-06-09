package com.smartllm.advisor.llm;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

/**
 * The two fields the LLM returns from analysis.
 * Token counting is intentionally NOT done by the LLM — it's computed
 * server-side by TokenEstimationService per model for accuracy.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class OllamaAnalysisResult {
    private String category;
    private Integer qualityScore;
}
