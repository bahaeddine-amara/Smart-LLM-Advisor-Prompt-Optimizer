package com.smartllm.advisor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OptimizeResponse {
    private String optimizedPrompt;
    private Integer tokensBefore;
    private Integer tokensAfter;
    private Double savingsPercent;
    private Double costBefore;
    private Double costAfter;
}