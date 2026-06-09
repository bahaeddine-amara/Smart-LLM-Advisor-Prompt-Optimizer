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
    private Integer estimatedTokens;
    private Map<String, Double> costEstimates;
    private Map<String, String> recommendations;
}