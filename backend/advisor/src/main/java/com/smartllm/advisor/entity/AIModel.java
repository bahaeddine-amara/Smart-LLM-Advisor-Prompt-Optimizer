package com.smartllm.advisor.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "ai_model")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String provider;

    @Column(name = "model_name", nullable = false, unique = true, length = 50)
    private String modelName;

    @Column(name = "input_price", nullable = false, precision = 10, scale = 6)
    private BigDecimal inputPrice;

    @Column(name = "output_price", nullable = false, precision = 10, scale = 6)
    private BigDecimal outputPrice;

    @Column(name = "overall_score", nullable = false, precision = 3, scale = 1)
    private BigDecimal overallScore;

    @Column(name = "coding_score", nullable = false, precision = 3, scale = 1)
    private BigDecimal codingScore;

    @Column(name = "research_score", nullable = false, precision = 3, scale = 1)
    private BigDecimal researchScore;

    @Column(name = "writing_score", nullable = false, precision = 3, scale = 1)
    private BigDecimal writingScore;
}