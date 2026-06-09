package com.smartllm.advisor.repository;

import com.smartllm.advisor.entity.AIModel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AIModelRepository extends JpaRepository<AIModel, Long> {
}