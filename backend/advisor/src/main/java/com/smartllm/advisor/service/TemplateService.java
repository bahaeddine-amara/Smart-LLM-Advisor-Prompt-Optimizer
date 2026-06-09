package com.smartllm.advisor.service;

import com.smartllm.advisor.dto.TemplateDto;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TemplateService {

    private static final List<TemplateDto> TEMPLATES = List.of(

        // ── Programming ──────────────────────────────────────────────────
        TemplateDto.builder()
            .id("prog-1")
            .title("Code Review")
            .category("Programming")
            .description("Get a thorough code review with specific feedback")
            .prompt("Please review the following [LANGUAGE] code. Identify: (1) bugs or logical errors, (2) performance issues, (3) security vulnerabilities, (4) code style violations. For each issue, explain the problem and suggest a fix.\n\n```[LANGUAGE]\n[PASTE YOUR CODE HERE]\n```")
            .tags(new String[]{"review", "quality", "bugs"})
            .build(),

        TemplateDto.builder()
            .id("prog-2")
            .title("Implement a Function")
            .category("Programming")
            .description("Get clean, documented code for a specific function")
            .prompt("Write a [LANGUAGE] function named [FUNCTION_NAME] that [DESCRIPTION OF WHAT IT DOES]. Requirements:\n- Input: [DESCRIBE PARAMETERS AND TYPES]\n- Output: [DESCRIBE RETURN VALUE AND TYPE]\n- Handle edge cases: [LIST EDGE CASES]\n- Include docstring/comments\n- Time complexity target: [O(n), O(1), etc.]")
            .tags(new String[]{"function", "implementation", "clean code"})
            .build(),

        TemplateDto.builder()
            .id("prog-3")
            .title("Debug This Error")
            .category("Programming")
            .description("Diagnose and fix a specific error")
            .prompt("I'm getting the following error in my [LANGUAGE] application:\n\nError: [PASTE ERROR MESSAGE]\n\nHere is the relevant code:\n```[LANGUAGE]\n[PASTE CODE]\n```\n\nContext: [Brief description of what the code is supposed to do]\n\nPlease: (1) explain the root cause, (2) provide a fixed version, (3) explain how to prevent this in the future.")
            .tags(new String[]{"debug", "error", "fix"})
            .build(),

        TemplateDto.builder()
            .id("prog-4")
            .title("REST API Design")
            .category("Programming")
            .description("Design a complete REST API for a resource")
            .prompt("Design a RESTful API for [RESOURCE/FEATURE]. Include:\n- All necessary endpoints with HTTP methods and URLs\n- Request/response body schemas (JSON)\n- HTTP status codes for success and error cases\n- Authentication approach\n- Pagination strategy if applicable\n\nThe API will be built with [TECH STACK] and serve [TYPE OF CLIENTS].")
            .tags(new String[]{"api", "rest", "design"})
            .build(),

        // ── Machine Learning ─────────────────────────────────────────────
        TemplateDto.builder()
            .id("ml-1")
            .title("Build an ML Pipeline")
            .category("Machine Learning")
            .description("Get a complete ML pipeline for your use case")
            .prompt("I want to build a machine learning model to [PREDICTION TASK]. My dataset has [N] samples with features: [LIST FEATURES]. The target variable is [TARGET] which is [continuous/categorical with N classes].\n\nPlease provide:\n1. Recommended algorithm(s) and why\n2. Feature preprocessing steps\n3. Training/validation split strategy\n4. Evaluation metrics to use\n5. Python code skeleton using scikit-learn/PyTorch/TensorFlow")
            .tags(new String[]{"pipeline", "scikit-learn", "training"})
            .build(),

        TemplateDto.builder()
            .id("ml-2")
            .title("Model Evaluation")
            .category("Machine Learning")
            .description("Analyze and interpret your model's performance")
            .prompt("Analyze the performance of my [MODEL TYPE] model:\n\nMetrics:\n- Accuracy: [VALUE]\n- Precision: [VALUE]\n- Recall: [VALUE]\n- F1: [VALUE]\n- [OTHER METRICS]\n\nTask: [CLASSIFICATION/REGRESSION for DOMAIN]\nClass distribution: [BALANCED/IMBALANCED — N positive, M negative]\n\nPlease: (1) interpret these results, (2) identify potential issues (overfitting, class imbalance), (3) suggest specific improvements.")
            .tags(new String[]{"evaluation", "metrics", "performance"})
            .build(),

        TemplateDto.builder()
            .id("ml-3")
            .title("Feature Engineering")
            .category("Machine Learning")
            .description("Get feature engineering ideas for your dataset")
            .prompt("I'm working on a [TASK] prediction problem. My current features are: [LIST FEATURES]. The target is [TARGET VARIABLE].\n\nPlease suggest:\n1. New features I could derive from existing ones\n2. Interaction terms worth exploring\n3. How to handle categorical variables: [LIST THEM]\n4. How to handle missing values in: [COLUMNS WITH MISSING DATA]\n5. Feature scaling/normalization recommendations")
            .tags(new String[]{"features", "preprocessing", "data"})
            .build(),

        // ── DevOps ───────────────────────────────────────────────────────
        TemplateDto.builder()
            .id("devops-1")
            .title("Dockerfile for App")
            .category("DevOps")
            .description("Generate a production-ready Dockerfile")
            .prompt("Create a production-ready Dockerfile for a [LANGUAGE/FRAMEWORK] application. The app:\n- Runs on port [PORT]\n- Requires environment variables: [LIST ENV VARS]\n- Has dependencies in [requirements.txt / package.json / pom.xml]\n- Should use [BASE IMAGE] as base\n\nRequirements: multi-stage build, non-root user, .dockerignore, minimal image size.")
            .tags(new String[]{"docker", "container", "deployment"})
            .build(),

        TemplateDto.builder()
            .id("devops-2")
            .title("CI/CD Pipeline")
            .category("DevOps")
            .description("Create a complete CI/CD pipeline configuration")
            .prompt("Create a [GitHub Actions / GitLab CI / Jenkins] pipeline for a [LANGUAGE] application that:\n1. Runs on push to main and pull requests\n2. Executes unit tests\n3. Builds a Docker image\n4. Pushes to [Docker Hub / ECR / GCR]\n5. Deploys to [AWS/GCP/Azure] [ENVIRONMENT]\n\nInclude secrets handling, caching for faster builds, and notifications on failure.")
            .tags(new String[]{"ci-cd", "automation", "github-actions"})
            .build(),

        TemplateDto.builder()
            .id("devops-3")
            .title("Kubernetes Deployment")
            .category("DevOps")
            .description("Generate K8s manifests for your application")
            .prompt("Generate Kubernetes manifests for deploying [APP NAME]. Requirements:\n- Image: [DOCKER IMAGE]\n- Replicas: [N]\n- CPU/Memory limits: [SPECIFY]\n- Environment variables from ConfigMap and Secrets\n- Health check endpoints: [LIVENESS PATH] and [READINESS PATH]\n- Service type: [ClusterIP/NodePort/LoadBalancer]\n- Include HorizontalPodAutoscaler with min [N] max [M] replicas")
            .tags(new String[]{"kubernetes", "k8s", "manifests"})
            .build(),

        // ── Writing ──────────────────────────────────────────────────────
        TemplateDto.builder()
            .id("write-1")
            .title("Technical Blog Post")
            .category("Writing")
            .description("Create a structured technical article")
            .prompt("Write a technical blog post about [TOPIC] for [TARGET AUDIENCE — e.g., junior developers, data scientists]. The post should:\n- Be approximately [N] words\n- Include an engaging introduction that explains why this matters\n- Have [N] main sections with clear headers\n- Include code examples in [LANGUAGE]\n- End with key takeaways\n- Tone: [conversational/formal/tutorial-style]")
            .tags(new String[]{"blog", "technical", "tutorial"})
            .build(),

        TemplateDto.builder()
            .id("write-2")
            .title("Professional Email")
            .category("Writing")
            .description("Draft a clear, professional email")
            .prompt("Write a professional email with the following details:\n- From: [YOUR ROLE]\n- To: [RECIPIENT AND THEIR ROLE]\n- Purpose: [MAIN GOAL OF THE EMAIL]\n- Key points to cover: [LIST POINTS]\n- Desired outcome: [WHAT YOU WANT THE RECIPIENT TO DO]\n- Tone: [formal/friendly/urgent]\n- Length: [brief/medium/detailed]")
            .tags(new String[]{"email", "professional", "communication"})
            .build(),

        TemplateDto.builder()
            .id("write-3")
            .title("README Documentation")
            .category("Writing")
            .description("Generate comprehensive project documentation")
            .prompt("Write a comprehensive README.md for a [TYPE] project called [PROJECT NAME]. Include:\n- Project description and what problem it solves\n- Key features (bullet list)\n- Tech stack\n- Prerequisites\n- Installation steps\n- Configuration (environment variables)\n- Usage examples with code snippets\n- API documentation (if applicable)\n- Contributing guidelines\n- License section")
            .tags(new String[]{"documentation", "readme", "markdown"})
            .build(),

        // ── Research ─────────────────────────────────────────────────────
        TemplateDto.builder()
            .id("res-1")
            .title("Topic Deep Dive")
            .category("Research")
            .description("Get a comprehensive analysis of any topic")
            .prompt("Provide a comprehensive analysis of [TOPIC]. Structure your response as:\n1. Definition and overview\n2. Historical context / background\n3. Current state / key developments\n4. Main challenges or controversies\n5. Future outlook\n6. Key sources or references to explore further\n\nTarget depth: [beginner overview / intermediate analysis / expert-level detail]\nFocus specifically on: [SPECIFIC ASPECT IF ANY]")
            .tags(new String[]{"analysis", "research", "comprehensive"})
            .build(),

        TemplateDto.builder()
            .id("res-2")
            .title("Compare & Contrast")
            .category("Research")
            .description("Get a structured comparison of two options")
            .prompt("Compare and contrast [OPTION A] vs [OPTION B] for [USE CASE / CONTEXT]. Evaluate them on:\n1. [CRITERION 1 — e.g., performance]\n2. [CRITERION 2 — e.g., cost]\n3. [CRITERION 3 — e.g., ease of use]\n4. [CRITERION 4 — e.g., scalability]\n5. Community and support\n\nEnd with a recommendation for: [YOUR SPECIFIC SITUATION/REQUIREMENTS]")
            .tags(new String[]{"comparison", "decision", "evaluation"})
            .build(),

        // ── General ──────────────────────────────────────────────────────
        TemplateDto.builder()
            .id("gen-1")
            .title("Explain Like I'm 5")
            .category("General")
            .description("Get a simple, clear explanation of complex concepts")
            .prompt("Explain [CONCEPT] in simple terms, as if you're explaining to someone with no background in [DOMAIN]. Use:\n- An everyday analogy to introduce the concept\n- Plain language (no jargon, or explain jargon when used)\n- A concrete real-world example\n- A summary in 2-3 sentences\n\nAfter the simple explanation, provide a slightly more technical version for someone who wants to go deeper.")
            .tags(new String[]{"explain", "beginner", "analogy"})
            .build(),

        TemplateDto.builder()
            .id("gen-2")
            .title("Action Plan")
            .category("General")
            .description("Create a structured action plan for any goal")
            .prompt("Create a detailed action plan for [GOAL]. Context:\n- Current situation: [WHERE I AM NOW]\n- Available resources: [TIME/BUDGET/TOOLS]\n- Timeline: [DEADLINE]\n- Main constraints: [LIMITATIONS]\n\nProvide:\n1. Breakdown into phases/milestones\n2. Specific tasks for each phase\n3. Success metrics\n4. Potential risks and mitigation strategies\n5. First 3 actions I should take this week")
            .tags(new String[]{"planning", "goals", "productivity"})
            .build()
    );

    public List<TemplateDto> getAll() {
        return TEMPLATES;
    }

    public List<TemplateDto> getByCategory(String category) {
        return TEMPLATES.stream()
                .filter(t -> t.getCategory().equalsIgnoreCase(category))
                .collect(Collectors.toList());
    }
}
