package com.smartllm.advisor.service;

import com.smartllm.advisor.dto.StatisticsDto;
import com.smartllm.advisor.entity.User;
import com.smartllm.advisor.repository.PromptRepository;
import com.smartllm.advisor.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class StatisticsService {

    @Autowired private PromptRepository promptRepository;
    @Autowired private UserRepository userRepository;

    public StatisticsDto getStatistics() {
        User user = getCurrentUser();
        Long userId = user.getId();

        long totalPrompts = promptRepository.countByUserId(userId);
        Long tokensSaved  = promptRepository.sumTokensSavedByUserId(userId);
        Double moneySaved = promptRepository.sumMoneySavedByUserId(userId);
        Double avgQuality = promptRepository.avgQualityScoreByUserId(userId);

        // Category breakdown for dashboard chart
        List<Object[]> rows = promptRepository.countByCategoryForUser(userId);
        Map<String, Long> categoryBreakdown = new LinkedHashMap<>();
        for (Object[] row : rows) {
            String cat = row[0] != null ? row[0].toString() : "General";
            Long count  = ((Number) row[1]).longValue();
            categoryBreakdown.put(cat, count);
        }

        return StatisticsDto.builder()
                .totalPrompts(totalPrompts)
                .totalTokensSaved(tokensSaved != null ? tokensSaved : 0L)
                .totalMoneySaved(moneySaved != null ? moneySaved : 0.0)
                .averageQualityScore(avgQuality != null ? Math.round(avgQuality * 10.0) / 10.0 : 0.0)
                .categoryBreakdown(categoryBreakdown)
                .build();
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
