package com.smartllm.advisor.config;

import com.smartllm.advisor.entity.AIModel;
import com.smartllm.advisor.repository.AIModelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DataInitializer implements ApplicationRunner {

    @Autowired
    private AIModelRepository aiModelRepository;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (aiModelRepository.count() == 0) {
            aiModelRepository.saveAll(List.of(
                AIModel.builder()
                    .provider("OpenAI")
                    .modelName("GPT-5")
                    .inputPrice(new BigDecimal("0.030000"))
                    .outputPrice(new BigDecimal("0.060000"))
                    .overallScore(new BigDecimal("9.2"))
                    .codingScore(new BigDecimal("9.5"))
                    .researchScore(new BigDecimal("8.8"))
                    .writingScore(new BigDecimal("9.0"))
                    .build(),
                AIModel.builder()
                    .provider("Anthropic")
                    .modelName("Claude Sonnet")
                    .inputPrice(new BigDecimal("0.015000"))
                    .outputPrice(new BigDecimal("0.030000"))
                    .overallScore(new BigDecimal("8.9"))
                    .codingScore(new BigDecimal("8.5"))
                    .researchScore(new BigDecimal("9.2"))
                    .writingScore(new BigDecimal("9.1"))
                    .build(),
                AIModel.builder()
                    .provider("Google")
                    .modelName("Gemini Pro")
                    .inputPrice(new BigDecimal("0.020000"))
                    .outputPrice(new BigDecimal("0.040000"))
                    .overallScore(new BigDecimal("8.5"))
                    .codingScore(new BigDecimal("8.0"))
                    .researchScore(new BigDecimal("8.7"))
                    .writingScore(new BigDecimal("8.3"))
                    .build(),
                AIModel.builder()
                    .provider("DeepSeek")
                    .modelName("DeepSeek Chat")
                    .inputPrice(new BigDecimal("0.001000"))
                    .outputPrice(new BigDecimal("0.002000"))
                    .overallScore(new BigDecimal("7.8"))
                    .codingScore(new BigDecimal("7.5"))
                    .researchScore(new BigDecimal("7.0"))
                    .writingScore(new BigDecimal("8.2"))
                    .build()
            ));
            System.out.println("✅ AI Models seeded successfully.");
        }
    }
}