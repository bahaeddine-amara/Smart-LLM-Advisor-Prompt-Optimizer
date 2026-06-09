package com.smartllm.advisor.dto;

import lombok.Data;

@Data
public class PromptSaveRequest {
    private String originalPrompt;
    private String optimizedPrompt;
    private String category;
    private Integer qualityScore;
    private Integer tokensBefore;
    private Integer tokensAfter;
    private Double costBefore;
    private Double costAfter;
    private String recommendedModel;
    private String optimizationMode;
}