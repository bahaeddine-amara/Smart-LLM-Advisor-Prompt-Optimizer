package com.smartllm.advisor.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AbTestRequest {
    @NotBlank
    private String promptA;
    @NotBlank
    private String promptB;
}
