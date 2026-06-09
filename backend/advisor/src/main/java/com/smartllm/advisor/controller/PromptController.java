package com.smartllm.advisor.controller;

import com.smartllm.advisor.dto.*;
import com.smartllm.advisor.service.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/prompts")
public class PromptController {

    @Autowired private AnalysisService analysisService;
    @Autowired private OptimizationService optimizationService;
    @Autowired private PromptService promptService;
    @Autowired private StatisticsService statisticsService;

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
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(promptService.getHistory(page, size));
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
}
