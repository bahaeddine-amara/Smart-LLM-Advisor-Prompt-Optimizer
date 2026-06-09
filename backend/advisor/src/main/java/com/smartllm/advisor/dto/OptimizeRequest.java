package com.smartllm.advisor.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OptimizeRequest {

    @NotBlank
    private String originalPrompt;

    @NotBlank
    private String mode; // "PERFORMANCE" or "ECONOMY"
}