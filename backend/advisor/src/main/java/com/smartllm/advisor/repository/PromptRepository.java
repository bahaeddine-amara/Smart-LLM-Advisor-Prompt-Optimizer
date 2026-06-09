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

    // Filter by category
    Page<Prompt> findByUserIdAndCategoryOrderByCreatedAtDesc(
            Long userId, String category, Pageable pageable);

    // Full text search on original prompt
    @Query("SELECT p FROM Prompt p WHERE p.user.id = :userId " +
           "AND LOWER(p.originalPrompt) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "ORDER BY p.createdAt DESC")
    Page<Prompt> searchByUserIdAndText(@Param("userId") Long userId,
                                       @Param("search") String search,
                                       Pageable pageable);

    // Filter by category + search
    @Query("SELECT p FROM Prompt p WHERE p.user.id = :userId " +
           "AND p.category = :category " +
           "AND LOWER(p.originalPrompt) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "ORDER BY p.createdAt DESC")
    Page<Prompt> searchByUserIdAndCategoryAndText(@Param("userId") Long userId,
                                                   @Param("category") String category,
                                                   @Param("search") String search,
                                                   Pageable pageable);

    @Query("SELECT COALESCE(SUM(p.tokensBefore - p.tokensAfter), 0) FROM Prompt p " +
           "WHERE p.user.id = :userId AND p.tokensAfter IS NOT NULL")
    Long sumTokensSavedByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(p.costBefore - p.costAfter), 0) FROM Prompt p " +
           "WHERE p.user.id = :userId AND p.costAfter IS NOT NULL")
    Double sumMoneySavedByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(AVG(p.qualityScore), 0) FROM Prompt p WHERE p.user.id = :userId")
    Double avgQualityScoreByUserId(@Param("userId") Long userId);

    // Category distribution for dashboard chart
    @Query("SELECT p.category, COUNT(p) FROM Prompt p WHERE p.user.id = :userId GROUP BY p.category")
    java.util.List<Object[]> countByCategoryForUser(@Param("userId") Long userId);
}
