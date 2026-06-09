package com.smartllm.advisor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatisticsDto {
    private long totalPrompts;
    private long totalTokensSaved;
    private double totalMoneySaved;
    private double averageQualityScore;
}