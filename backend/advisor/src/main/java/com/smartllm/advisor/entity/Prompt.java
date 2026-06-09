package com.smartllm.advisor.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "prompt",
       indexes = {
           @Index(name = "idx_prompt_user_id", columnList = "user_id"),
           @Index(name = "idx_prompt_created_at", columnList = "created_at")
       })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prompt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "original_prompt", nullable = false, columnDefinition = "TEXT")
    private String originalPrompt;

    @Column(name = "optimized_prompt", columnDefinition = "TEXT")
    private String optimizedPrompt;

    @Column(length = 50)
    private String category;

    @Column(name = "quality_score")
    private Integer qualityScore;

    @Column(name = "tokens_before")
    private Integer tokensBefore;

    @Column(name = "tokens_after")
    private Integer tokensAfter;

    @Column(name = "cost_before", precision = 10, scale = 6)
    private BigDecimal costBefore;

    @Column(name = "cost_after", precision = 10, scale = 6)
    private BigDecimal costAfter;

    @Column(name = "recommended_model", length = 50)
    private String recommendedModel;

    @Column(name = "optimization_mode", length = 20)
    private String optimizationMode;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}