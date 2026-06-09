package com.smartllm.advisor.service;

import com.smartllm.advisor.dto.PromptDto;
import com.smartllm.advisor.dto.PromptSaveRequest;
import com.smartllm.advisor.entity.Prompt;
import com.smartllm.advisor.entity.User;
import com.smartllm.advisor.repository.PromptRepository;
import com.smartllm.advisor.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class PromptService {

    @Autowired private PromptRepository promptRepository;
    @Autowired private UserRepository userRepository;

    public PromptDto save(PromptSaveRequest request) {
        User user = getCurrentUser();

        Prompt prompt = Prompt.builder()
                .originalPrompt(request.getOriginalPrompt())
                .optimizedPrompt(request.getOptimizedPrompt())
                .category(request.getCategory())
                .qualityScore(request.getQualityScore())
                .tokensBefore(request.getTokensBefore())
                .tokensAfter(request.getTokensAfter())
                .costBefore(request.getCostBefore() != null
                        ? BigDecimal.valueOf(request.getCostBefore()) : null)
                .costAfter(request.getCostAfter() != null
                        ? BigDecimal.valueOf(request.getCostAfter()) : null)
                .recommendedModel(request.getRecommendedModel())
                .optimizationMode(request.getOptimizationMode())
                .user(user)
                .build();

        Prompt saved = promptRepository.save(prompt);
        return toDto(saved);
    }

    public Page<PromptDto> getHistory(int page, int size) {
        User user = getCurrentUser();
        Pageable pageable = PageRequest.of(page, size);
        return promptRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable)
                .map(this::toDto);
    }

    public void delete(Long id) {
        User user = getCurrentUser();
        Prompt prompt = promptRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Prompt not found or access denied"));
        promptRepository.delete(prompt);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private PromptDto toDto(Prompt p) {
        return PromptDto.builder()
                .id(p.getId())
                .originalPrompt(p.getOriginalPrompt())
                .optimizedPrompt(p.getOptimizedPrompt())
                .category(p.getCategory())
                .qualityScore(p.getQualityScore())
                .tokensBefore(p.getTokensBefore())
                .tokensAfter(p.getTokensAfter())
                .costBefore(p.getCostBefore() != null ? p.getCostBefore().doubleValue() : null)
                .costAfter(p.getCostAfter() != null ? p.getCostAfter().doubleValue() : null)
                .recommendedModel(p.getRecommendedModel())
                .optimizationMode(p.getOptimizationMode())
                .createdAt(p.getCreatedAt())
                .build();
    }
}