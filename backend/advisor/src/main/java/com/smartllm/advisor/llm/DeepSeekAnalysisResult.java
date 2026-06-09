package com.smartllm.advisor.llm;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class DeepSeekAnalysisResult {
    private String category;
    private Integer qualityScore;
    private Integer estimatedTokens;
}