package com.smartllm.advisor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyzeResponse {
    private String category;
    private Integer qualityScore;

    /** Base token count (GPT-4 cl100k reference, shown in the UI headline) */
    private Integer estimatedTokens;

    /** Per-model token counts — each model tokenizes differently */
    private Map<String, Integer> tokensByModel;

    /** Per-model cost estimates in USD */
    private Map<String, Double> costEstimates;

    private Map<String, String> recommendations;
}
