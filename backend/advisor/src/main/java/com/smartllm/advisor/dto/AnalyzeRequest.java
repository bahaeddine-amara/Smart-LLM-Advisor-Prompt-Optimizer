package com.smartllm.advisor.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AnalyzeRequest {

    @NotBlank(message = "Prompt cannot be empty")
    private String prompt;
}