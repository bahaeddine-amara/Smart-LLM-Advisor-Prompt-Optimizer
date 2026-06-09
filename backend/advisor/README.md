# 🤖 Smart LLM Advisor — Backend

> Intelligent prompt analysis, cost estimation, and optimization engine powered by DeepSeek AI.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Author](#author)

---

## Overview

Smart LLM Advisor is a full-stack AI-powered application that helps users make smarter decisions when working with Large Language Models. This repository contains the **backend** — a RESTful API built with Spring Boot 3 that handles authentication, prompt analysis via DeepSeek, cost estimation across multiple AI models, intelligent recommendations, and prompt optimization.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Java 17 |
| Framework | Spring Boot 3.5 |
| Security | Spring Security + JWT (jjwt 0.12.3) |
| Persistence | Spring Data JPA + Hibernate |
| Database | H2 (dev) / MySQL 8 (prod) |
| AI Integration | DeepSeek Chat API |
| Build Tool | Maven 3.9+ |
| Utilities | Lombok |

---

## Features

- 🔐 **Authentication** — Register/login with BCrypt-hashed passwords and signed JWT tokens (24h expiry)
- 🔍 **Prompt Analysis** — Single DeepSeek API call returns category, quality score (0–100), and token estimate
- 💸 **Cost Estimation** — Calculates cost across GPT-5, Claude Sonnet, Gemini Pro, and DeepSeek Chat using real pricing data
- 🏆 **Recommendations** — Ranks models by Best Overall, Best Value, and Cheapest based on category-weighted scores
- ⚙️ **Prompt Optimization** — Rewrites prompts in Performance or Economy mode to reduce token usage
- 📋 **History** — Paginated prompt history per user with delete support
- 📊 **Statistics** — Aggregated dashboard data: total prompts, tokens saved, money saved, average quality

---

## Project Structure

```
src/main/java/com/smartllm/advisor/
│
├── config/
│   ├── SecurityConfig.java          # CORS, JWT filter chain, BCrypt bean
│   └── DataInitializer.java         # Seeds AI model pricing on startup
│
├── controller/
│   ├── AuthController.java          # POST /api/auth/register, /login
│   └── PromptController.java        # Analyze, optimize, save, history, stats
│
├── dto/                             # Request/Response data transfer objects
│
├── entity/
│   ├── User.java                    # app_user table
│   ├── Prompt.java                  # prompt table
│   └── AIModel.java                 # ai_model table
│
├── exception/
│   └── GlobalExceptionHandler.java  # Centralized error handling
│
├── llm/
│   ├── DeepSeekClient.java          # HTTP calls to DeepSeek API
│   └── DeepSeekAnalysisResult.java  # Parsed analysis DTO
│
├── repository/                      # JPA repositories (User, Prompt, AIModel)
│
├── security/
│   ├── JwtProvider.java             # Token generation & validation
│   ├── JwtAuthFilter.java           # Per-request JWT extraction
│   └── UserDetailsServiceImpl.java  # Spring Security user loader
│
├── service/
│   ├── AuthService.java
│   ├── AnalysisService.java
│   ├── CostEstimationService.java
│   ├── RecommendationService.java
│   ├── OptimizationService.java
│   ├── PromptService.java
│   └── StatisticsService.java
│
└── AdvisorApplication.java
```

---

## Getting Started

### Prerequisites

- Java 17+
- Maven 3.9+
- A DeepSeek API key → [platform.deepseek.com](https://platform.deepseek.com/api_keys)

### Run in development (H2 in-memory database)

```bash
# Clone the repository
git clone https://github.com/bahaeddine-amara/Smart-LLM-Advisor-Prompt-Optimizer.git
cd Smart-LLM-Advisor-Prompt-Optimizer

# Add your DeepSeek API key to application.properties
# deepseek.api.key=YOUR_KEY_HERE

# Start the server
./mvnw spring-boot:run
```

Server starts at **http://localhost:8081**

> H2 console available at **http://localhost:8081/h2-console**
> JDBC URL: `jdbc:h2:mem:smartllm` | Username: `sa` | Password: *(empty)*

### Run with MySQL (production)

1. Create the database:
```sql
CREATE DATABASE smartllm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Update `application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/smartllm
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.h2.console.enabled=false
```

---

## Environment Variables

| Key | Description | Example |
|---|---|---|
| `deepseek.api.key` | Your DeepSeek API key | `sk-xxxxxxxx` |
| `jwt.secret` | Secret string for signing JWT tokens | `MySecretKey123...` |
| `jwt.expiration` | Token expiry in milliseconds | `86400000` (24h) |
| `server.port` | Port the server runs on | `8081` |

---

## API Endpoints

All routes except `/api/auth/**` require the header:
```
Authorization: Bearer <your_jwt_token>
```

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create a new account |
| POST | `/api/auth/login` | Login and receive a JWT |

**Register body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePass123"
}
```

**Login body:**
```json
{
  "email": "john@example.com",
  "password": "securePass123"
}
```

**Login response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "userId": 1,
  "username": "john_doe"
}
```

---

### Prompts

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/prompts/analyze` | Analyze a prompt |
| POST | `/api/prompts/optimize` | Optimize a prompt |
| POST | `/api/prompts` | Save an analysis to history |
| GET | `/api/prompts` | Get paginated history |
| DELETE | `/api/prompts/{id}` | Delete a saved prompt |
| GET | `/api/prompts/stats` | Get dashboard statistics |

**Analyze body:**
```json
{ "prompt": "Create a Spring Boot microservice with JWT authentication" }
```

**Analyze response:**
```json
{
  "category": "Programming",
  "qualityScore": 82,
  "estimatedTokens": 120,
  "costEstimates": {
    "GPT-5": 0.000162,
    "Claude Sonnet": 0.000081,
    "Gemini Pro": 0.000108,
    "DeepSeek Chat": 0.0000054
  },
  "recommendations": {
    "bestOverall": "GPT-5",
    "bestValue": "DeepSeek Chat",
    "cheapest": "DeepSeek Chat"
  }
}
```

**Optimize body:**
```json
{
  "originalPrompt": "Create a Spring Boot microservice with JWT authentication",
  "mode": "ECONOMY"
}
```

**Optimize response:**
```json
{
  "optimizedPrompt": "Build Spring Boot microservice, JWT auth.",
  "tokensBefore": 120,
  "tokensAfter": 78,
  "savingsPercent": 35.0,
  "costBefore": 0.000162,
  "costAfter": 0.0001053
}
```

**Stats response:**
```json
{
  "totalPrompts": 14,
  "totalTokensSaved": 430,
  "totalMoneySaved": 0.000021,
  "averageQualityScore": 76.5
}
```

---

## Author

**Bahaeddine Amara**
Internship project @ Vermeg — 2026
[github.com/bahaeddine-amara](https://github.com/bahaeddine-amara)