package com.smartllm.advisor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemplateDto {
    private String id;
    private String title;
    private String category;
    private String description;
    private String prompt;
    private String[] tags;
}
