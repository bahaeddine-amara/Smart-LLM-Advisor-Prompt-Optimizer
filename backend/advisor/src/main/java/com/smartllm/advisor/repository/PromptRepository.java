package com.smartllm.advisor.repository;

import com.smartllm.advisor.entity.Prompt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface PromptRepository extends JpaRepository<Prompt, Long> {

    Page<Prompt> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Optional<Prompt> findByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);

    @Query("SELECT COALESCE(SUM(p.tokensBefore - p.tokensAfter), 0) FROM Prompt p " +
           "WHERE p.user.id = :userId AND p.tokensAfter IS NOT NULL")
    Long sumTokensSavedByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(p.costBefore - p.costAfter), 0) FROM Prompt p " +
           "WHERE p.user.id = :userId AND p.costAfter IS NOT NULL")
    Double sumMoneySavedByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(AVG(p.qualityScore), 0) FROM Prompt p WHERE p.user.id = :userId")
    Double avgQualityScoreByUserId(@Param("userId") Long userId);
}