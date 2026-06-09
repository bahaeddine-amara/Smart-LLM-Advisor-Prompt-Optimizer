package com.smartllm.advisor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScoreDetailResponse {
    private int clarity;        // Is the goal unambiguous?
    private int specificity;    // Are details, constraints, and scope defined?
    private int context;        // Is background information provided?
    private int actionability;  // Can an AI act on this directly?
    private int conciseness;    // Is it free of filler and redundancy?
    private int overall;        // Weighted composite
    private String suggestion;  // One concrete improvement tip
}
