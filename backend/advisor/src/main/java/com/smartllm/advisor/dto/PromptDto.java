package com.smartllm.advisor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromptDto {
    private Long id;
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
    private LocalDateTime createdAt;
}