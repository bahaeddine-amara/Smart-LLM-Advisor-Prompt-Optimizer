# Smart LLM Advisor — AI Prompt Studio

A full-stack AI prompt engineering workspace that runs **entirely locally** via Ollama. Analyze, score, optimize, compare, and template your prompts — with per-model token counts, cost estimates, and a 5-dimension quality breakdown.

---

## Features

| Feature | Description |
|---------|-------------|
| **Prompt Analyzer** | Category classification, quality score, per-model token counts and cost estimates |
| **Deep Score** | 5-dimension breakdown: Clarity, Specificity, Context, Actionability, Conciseness |
| **Prompt Optimizer** | Performance mode (clearer rewrite) and Economy mode (maximum compression) |
| **A/B Testing** | Run two prompt variants through Ollama and compare outputs side by side |
| **Templates Library** | 17+ ready-to-use templates across Programming, ML, DevOps, Writing, Research |
| **History** | Searchable, filterable archive with expandable cards |
| **Dashboard** | Usage stats and category breakdown chart |

---

## Tech Stack

**Backend** — Spring Boot 3.5 · Java 17 · Spring Security · JWT · Spring Data JPA · H2 (in-memory) · Lombok

**Frontend** — React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router v7 · Axios

**AI** — Ollama (local LLM, runs on GPU via CUDA or CPU)

---

## Requirements

| Tool | Version |
|------|---------|
| Java | 17+ |
| Node.js | 18+ |
| Ollama | Latest ([download](https://ollama.com/download)) |

---

## How to Run

You need **3 terminals** open simultaneously.

### Terminal 1 — Start Ollama

```cmd
ollama serve
```

> If it says "port already in use" → Ollama is already running. Skip this terminal.

**First time only** — pull the model:

```cmd
ollama pull llama3.1:8b
```

> Downloads ~4.7 GB once. For a lighter model use `phi3:mini` and update `ollama.model` in `application.properties`.

---

### Terminal 2 — Start the Backend

```cmd
cd backend\advisor
.\mvnw.cmd spring-boot:run
```

Wait for:
```
Started AdvisorApplication ... on port 8081
```

---

### Terminal 3 — Start the Frontend

```cmd
cd frontend
npm install
npm run dev
```

---

### Open the App

Go to **http://localhost:5173** in your browser.

> If port 5173 is taken, Vite will pick 5174. Use whichever port it shows.

---

## First Use

1. Click **Register** and create an account
   - The database is in-memory (H2) — it resets every time the backend restarts, so you'll need to re-register
2. Go to **Analyze** and paste any prompt
3. Click **Analyze** — the first call loads the model into VRAM, this can take **1–2 minutes**
4. Subsequent analyses are fast (5–20 seconds on GPU)

---

## Pages Overview

### Dashboard
- Stats: total prompts, tokens saved, money saved, average quality score
- Category breakdown bar chart
- Quick navigation to all features

### Analyze (`/analyze`)
- Paste your prompt and click **Analyze**
- Results:
  - Category (Programming / Machine Learning / DevOps / Writing / Research / General)
  - Quality score ring (0–100)
  - Per-model token counts — each model tokenizes differently, so GPT-5, Claude Sonnet, Gemini Pro, and DeepSeek Chat all show different values
  - Cost estimates per model in USD
  - Model recommendations: Best Overall, Best Value, Cheapest
- **Deep Score** button: 5-dimension breakdown with a concrete improvement suggestion
- **Optimize** (Performance or Economy mode): rewrites the prompt via Ollama
- **Save to History**

### Templates (`/templates`)
- 17 built-in templates across all categories
- Search by title, description, or tags
- Filter by category
- **Copy** to clipboard or **Use Template** to load directly into Analyze

### A/B Test (`/ab-test`)
- Enter two prompt variants
- Ollama runs both sequentially
- Side-by-side output comparison with a winner verdict

### History (`/history`)
- All saved analyses
- Live text search
- Filter by category
- Expandable cards showing original and optimized prompts
- Delete entries

---

## Prompt Categories

| Category | When it's used |
|----------|----------------|
| Programming | Code, debugging, APIs, software architecture |
| Machine Learning | ML/AI model building, training, predictions, data science |
| DevOps | Docker, CI/CD, cloud, Kubernetes, infrastructure |
| Writing | Essays, emails, content, copywriting |
| Research | Academic analysis, literature review, non-technical research |
| General | Everything else |

---

## Per-Model Token Estimation

Different AI providers use different tokenizers, so the same prompt produces different token counts:

| Model | Tokenizer | Prose multiplier | Code multiplier |
|-------|-----------|-----------------|-----------------|
| GPT-5 | cl100k_base | 0.75 tokens/word | 1.30 tokens/word |
| Claude Sonnet | Claude tokenizer | 0.80 | 1.20 |
| Gemini Pro | SentencePiece | 0.85 | 1.35 |
| DeepSeek Chat | Custom BPE | 0.90 | 1.40 |

Costs are computed from each model's own token count × its published input/output prices.

---

## API Endpoints

All endpoints require `Authorization: Bearer <token>` except auth routes.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/prompts/analyze` | Analyze a prompt |
| POST | `/api/prompts/score-detail` | Get 5-dimension score breakdown |
| POST | `/api/prompts/optimize` | Optimize a prompt (PERFORMANCE or ECONOMY) |
| POST | `/api/prompts/ab-test` | A/B test two prompts |
| GET | `/api/prompts/templates` | List templates (optional `?category=`) |
| POST | `/api/prompts` | Save a prompt to history |
| GET | `/api/prompts` | Get history (supports `?page=&size=&category=&search=`) |
| DELETE | `/api/prompts/{id}` | Delete a saved prompt |
| GET | `/api/prompts/stats` | Get user statistics |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Cannot reach backend` | Run `.\mvnw.cmd spring-boot:run` in `backend\advisor` |
| `Analysis failed` after backend restart | Clear localStorage: DevTools → Application → Local Storage → delete `token` and `user` → re-login |
| `Ollama CUDA error` | Run `set CUDA_VISIBLE_DEVICES=` before `ollama serve` to force CPU mode |
| Vite uses port 5174 instead of 5173 | Normal — another app is using 5173. Use the port Vite prints |
| First analysis takes 2 minutes | Normal — Ollama loads the model into memory on the first call. Fast after that |
| Backend won't start on port 8081 | Another app (e.g. Oracle TNS) is using that port. Change `server.port` in `application.properties` |

---

## Project Structure

```
smart-llm-advisor/
├── backend/advisor/
│   └── src/main/java/com/smartllm/advisor/
│       ├── config/          DataInitializer (seeds AI model pricing)
│       ├── controller/      AuthController, PromptController
│       ├── dto/             Request/response DTOs
│       ├── entity/          User, Prompt, AIModel
│       ├── llm/             OllamaClient, OllamaAnalysisResult
│       ├── repository/      JPA repositories
│       ├── security/        JWT filter, provider, UserDetailsService
│       └── service/         Analysis, Optimization, AB Test, Templates,
│                            Score Detail, Token Estimation, Statistics
└── frontend/src/
    ├── components/layout/   Navbar
    ├── context/             AuthContext
    ├── lib/                 axiosInstance (JWT interceptor)
    ├── pages/               Dashboard, Analyze, Templates, AbTest, History,
    │                        Login, Register
    └── services/            authService, promptService
```
