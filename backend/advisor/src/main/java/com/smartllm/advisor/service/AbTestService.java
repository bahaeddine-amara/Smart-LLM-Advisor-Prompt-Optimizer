package com.smartllm.advisor.service;

import com.smartllm.advisor.dto.AbTestResponse;
import com.smartllm.advisor.llm.OllamaClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AbTestService {

    @Autowired private OllamaClient ollamaClient;
    @Autowired private TokenEstimationService tokenEstimationService;

    public AbTestResponse runTest(String promptA, String promptB) {
        // Run both prompts (sequentially — Ollama is single-threaded locally)
        String outputA = ollamaClient.runPrompt(promptA);
        String outputB = ollamaClient.runPrompt(promptB);

        int tokensA = tokenEstimationService.estimateBaseTokens(promptA);
        int tokensB = tokenEstimationService.estimateBaseTokens(promptB);

        // Quality = output length * clarity heuristic (longer, more detailed output = better prompt)
        // Normalize by input tokens to reward concise prompts that generate rich output
        int outputLenA = outputA.split("\\s+").length;
        int outputLenB = outputB.split("\\s+").length;

        double ratioA = tokensA > 0 ? (double) outputLenA / tokensA : 0;
        double ratioB = tokensB > 0 ? (double) outputLenB / tokensB : 0;

        // Quality score: base 50 + output richness bonus, capped at 95
        int qualityA = Math.min(95, 50 + (int)(ratioA * 10));
        int qualityB = Math.min(95, 50 + (int)(ratioB * 10));

        String winner;
        String verdict;
        int diff = Math.abs(qualityA - qualityB);

        if (diff <= 3) {
            winner = "TIE";
            verdict = "Both prompts produced comparable outputs. " +
                      (tokensA <= tokensB ? "Prompt A is more concise." : "Prompt B is more concise.");
        } else if (qualityA > qualityB) {
            winner = "A";
            verdict = "Prompt A generated a richer, more detailed response relative to its length.";
        } else {
            winner = "B";
            verdict = "Prompt B generated a richer, more detailed response relative to its length.";
        }

        return AbTestResponse.builder()
                .promptA(promptA).outputA(outputA).tokensA(tokensA).qualityA(qualityA)
                .promptB(promptB).outputB(outputB).tokensB(tokensB).qualityB(qualityB)
                .winner(winner).verdict(verdict)
                .build();
    }
}
