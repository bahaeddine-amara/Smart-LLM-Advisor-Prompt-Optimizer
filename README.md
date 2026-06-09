# Smart LLM Advisor

AI-powered prompt analyzer — quality scoring, cost estimation, model recommendations, and optimization. Runs entirely locally via Ollama.

---

## Requirements

| Tool | Version |
|------|---------|
| Java | 17+ |
| Node.js | 18+ |
| Ollama | Latest |

---

## How to Run (step by step)

### Step 1 — Start Ollama (CPU mode, no GPU needed)

Open a terminal and run:

```cmd
set CUDA_VISIBLE_DEVICES=
ollama serve
```

> If it says "port already in use", Ollama is already running — skip to Step 2.

### Step 2 — Pull the model (first time only)

```cmd
ollama pull llama3.1:8b
```

> This downloads ~4.7GB. Only needed once.
> For a faster/lighter model: `ollama pull phi3:mini` and update `ollama.model=phi3:mini` in `application.properties`.

### Step 3 — Start the Backend

Open a **new** terminal:

```cmd
cd backend\advisor
.\mvnw.cmd spring-boot:run
```

Wait for: `Started AdvisorApplication on port 8081`

### Step 4 — Start the Frontend

Open a **new** terminal:

```cmd
cd frontend
npm install
npm run dev
```

Open your browser at: **http://localhost:5173** (or 5174 if 5173 is taken)

---

## First Use

1. Click **Register** and create an account
2. Go to **Analyze**
3. Type any prompt and click **Analyze**
4. The first analysis loads the model — wait up to **2 minutes**
5. Subsequent analyses are fast (5–20 seconds)

---

## Architecture

```
Browser (React + Vite)  →  Spring Boot API (8081)  →  Ollama (11434)
         ↕                        ↕
    JWT Auth             H2 in-memory DB
```

### Prompt Categories
- **Programming** — code, debugging, APIs, algorithms
- **Machine Learning** — ML/AI models, training, predictions, data science
- **DevOps** — Docker, CI/CD, cloud, infrastructure
- **Writing** — essays, content, copywriting
- **Research** — academic, scientific, non-technical analysis
- **General** — everything else

### Model Comparisons
Costs are estimated against: GPT-5, Claude Sonnet, Gemini Pro, DeepSeek Chat

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `Cannot reach backend` | Run `.\mvnw.cmd spring-boot:run` in `backend\advisor` |
| `Analysis failed` | Clear browser localStorage (DevTools → Application → Local Storage → delete all) then re-login |
| `Ollama CUDA error` | Run `set CUDA_VISIBLE_DEVICES=` before `ollama serve` to force CPU mode |
| `Port 5173 in use` | Vite auto-picks 5174 — just use that URL |
| Slow first analysis | Normal — Ollama loads the model into RAM. Wait 1–2 min |
