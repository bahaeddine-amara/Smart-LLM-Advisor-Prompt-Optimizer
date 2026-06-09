package com.smartllm.advisor.controller;

import com.smartllm.advisor.dto.*;
import com.smartllm.advisor.service.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/prompts")
public class PromptController {

    @Autowired private AnalysisService    analysisService;
    @Autowired private OptimizationService optimizationService;
    @Autowired private PromptService      promptService;
    @Autowired private StatisticsService  statisticsService;
    @Autowired private ScoreDetailService  scoreDetailService;
    @Autowired private AbTestService       abTestService;
    @Autowired private TemplateService     templateService;

    // ── Core ──────────────────────────────────────────────────────────────

    @PostMapping("/analyze")
    public ResponseEntity<AnalyzeResponse> analyze(@Valid @RequestBody AnalyzeRequest request) {
        return ResponseEntity.ok(analysisService.analyze(request.getPrompt()));
    }

    @PostMapping("/optimize")
    public ResponseEntity<OptimizeResponse> optimize(@Valid @RequestBody OptimizeRequest request) {
        return ResponseEntity.ok(optimizationService.optimize(
                request.getOriginalPrompt(), request.getMode()));
    }

    @PostMapping
    public ResponseEntity<PromptDto> save(@RequestBody PromptSaveRequest request) {
        return ResponseEntity.status(201).body(promptService.save(request));
    }

    @GetMapping
    public ResponseEntity<Page<PromptDto>> getHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(promptService.getHistory(page, size, category, search));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        promptService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }

    @GetMapping("/stats")
    public ResponseEntity<StatisticsDto> getStats() {
        return ResponseEntity.ok(statisticsService.getStatistics());
    }

    // ── New: Detailed Score ───────────────────────────────────────────────

    @PostMapping("/score-detail")
    public ResponseEntity<ScoreDetailResponse> scoreDetail(@Valid @RequestBody AnalyzeRequest request) {
        return ResponseEntity.ok(scoreDetailService.getDetailedScore(request.getPrompt()));
    }

    // ── New: A/B Test ─────────────────────────────────────────────────────

    @PostMapping("/ab-test")
    public ResponseEntity<AbTestResponse> abTest(@Valid @RequestBody AbTestRequest request) {
        return ResponseEntity.ok(abTestService.runTest(request.getPromptA(), request.getPromptB()));
    }

    // ── New: Templates ────────────────────────────────────────────────────

    @GetMapping("/templates")
    public ResponseEntity<List<TemplateDto>> getTemplates(
            @RequestParam(required = false) String category) {
        if (category != null && !category.isBlank()) {
            return ResponseEntity.ok(templateService.getByCategory(category));
        }
        return ResponseEntity.ok(templateService.getAll());
    }
}
