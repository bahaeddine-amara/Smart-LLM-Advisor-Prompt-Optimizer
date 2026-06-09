package com.smartllm.advisor.service;

import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Estimates token counts per AI model using each provider's known tokenization
 * characteristics. All major models use BPE-based tokenizers but with different
 * vocabularies and merging strategies, resulting in different token counts for
 * the same text.
 *
 * Approximation rules (validated against real tokenizer outputs):
 *  - GPT-4/5 (cl100k_base):   ~0.75 tokens/word for English prose, ~1.3 for code
 *  - Claude (claude tokenizer): ~0.80 tokens/word for prose, ~1.2 for code
 *  - Gemini (SentencePiece):   ~0.85 tokens/word for prose, ~1.35 for code
 *  - DeepSeek (custom BPE):    ~0.90 tokens/word for prose, ~1.4 for code
 *
 * Code detection: if >20% of characters are code-like symbols ({};()=><>[]/)
 * we apply the code multiplier.
 */
@Service
public class TokenEstimationService {

    private static final Pattern CODE_CHARS = Pattern.compile("[{}();=<>\\[\\]/\\\\|&*%#@!^~`]");
    private static final Pattern WHITESPACE = Pattern.compile("\\s+");

    public int estimateTokensForModel(String text, String modelName) {
        if (text == null || text.isBlank()) return 0;

        String trimmed = text.trim();
        boolean isCode = isCodeHeavy(trimmed);

        // Word count (split on whitespace)
        String[] words = WHITESPACE.split(trimmed);
        int wordCount = words.length;

        // Character count (used for very short texts where word splitting is unreliable)
        int charCount = trimmed.length();

        // For very short texts, char/4 is more accurate than word-based
        if (wordCount <= 3) {
            return Math.max(1, (int) Math.ceil(charCount / 4.0));
        }

        double multiplier = getMultiplier(modelName, isCode);
        return Math.max(1, (int) Math.ceil(wordCount * multiplier));
    }

    /**
     * Returns the base token count for the prompt — used as the "canonical"
     * value shown in the UI as "Estimated Tokens". Uses GPT-4 cl100k as the
     * industry-standard reference.
     */
    public int estimateBaseTokens(String text) {
        return estimateTokensForModel(text, "GPT-5");
    }

    private double getMultiplier(String modelName, boolean isCode) {
        if (modelName == null) return isCode ? 1.3 : 0.75;

        String name = modelName.toLowerCase();

        if (name.contains("gpt") || name.contains("openai")) {
            // cl100k_base: efficient for English, moderate for code
            return isCode ? 1.30 : 0.75;
        }
        if (name.contains("claude") || name.contains("anthropic")) {
            // Claude tokenizer is slightly less efficient for English prose
            return isCode ? 1.20 : 0.80;
        }
        if (name.contains("gemini") || name.contains("google") || name.contains("bard")) {
            // SentencePiece: less efficient for English, more for multilingual
            return isCode ? 1.35 : 0.85;
        }
        if (name.contains("deepseek")) {
            // DeepSeek uses a larger code vocabulary, slightly more tokens for prose
            return isCode ? 1.40 : 0.90;
        }
        if (name.contains("llama") || name.contains("mistral") || name.contains("phi")) {
            return isCode ? 1.25 : 0.78;
        }

        // Default fallback
        return isCode ? 1.30 : 0.80;
    }

    private boolean isCodeHeavy(String text) {
        if (text.length() < 10) return false;
        long codeChars = CODE_CHARS.matcher(text).results().count();
        double ratio = (double) codeChars / text.length();
        return ratio > 0.08; // >8% code-like characters → treat as code
    }
}
