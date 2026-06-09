package com.smartllm.advisor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AbTestResponse {
    private String promptA;
    private String outputA;
    private int tokensA;
    private int qualityA;

    private String promptB;
    private String outputB;
    private int tokensB;
    private int qualityB;

    private String winner;   // "A", "B", or "TIE"
    private String verdict;  // One sentence explanation
}
