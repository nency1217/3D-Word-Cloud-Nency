# 3D Word Cloud - Nency

An interactive web application that visualizes topics from news articles as an immersive 3D word cloud with cyber-neural glassmorphism design.

## Overview

Enter a news article URL and watch as the app extracts key topics using NLP and renders them in a stunning 3D visualization. Words are sized by relevance, colored by weight tier, and arranged on a fibonacci sphere with bloom post-processing and a starfield background.

## Tech Stack

### Frontend
- **React 18** + **TypeScript** — UI framework
- **React Three Fiber** — React renderer for Three.js
- **@react-three/drei** — R3F helpers (Text, OrbitControls, Float)
- **@react-three/postprocessing** — Bloom effect
- **@react-spring/three** — Smooth spring animations
- **framer-motion** — DOM animation for InfoPanel
- **Vite** — Build tool and dev server

### Backend
- **FastAPI** — Python async web framework
- **Firecrawl** — Article text extraction (handles JS-rendered pages)
- **spaCy** — Named entity recognition (en_core_web_sm)
- **scikit-learn** — TF-IDF keyword extraction
- **vaderSentiment** — Sentiment analysis per keyword
- **httpx** — Async HTTP client

## Setup & Run

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm

### Environment Variables

Copy the example env files and configure:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

| Variable | File | Default | Description |
|---|---|---|---|
| `FIRECRAWL_API_KEY` | `backend/.env` | *(empty)* | Firecrawl API key (optional — falls back to BeautifulSoup) |
| `FIRECRAWL_URL` | `backend/.env` | `https://api.firecrawl.dev/v1/scrape` | Firecrawl endpoint |
| `CORS_ORIGINS` | `backend/.env` | `http://localhost:5173,http://127.0.0.1:5173` | Comma-separated allowed origins |
| `VITE_API_URL` | `frontend/.env` | `http://localhost:8000` | Backend API base URL |

### One-Command Setup (macOS)

```bash
chmod +x setup.sh
./setup.sh
```

This will:
1. Create a Python virtual environment and install backend dependencies
2. Download the spaCy language model (`en_core_web_sm`)
3. Install frontend npm packages
4. Start both servers concurrently (backend on :8000, frontend on :5173)

### Manual Setup

**Backend** (Terminal 1):
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn main:app --reload --port 8000
```

**Frontend** (Terminal 2):
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev -- --port 5173
```

## Usage

1. Open http://localhost:5173
2. Paste a news article URL or click a quick-start chip (BBC, TechCrunch, etc.)
3. Wait for the NLP pipeline to process the article
4. Explore the 3D word cloud — drag to orbit, hover for glow, click for details

## API

### `POST /analyze`

**Request:**
```json
{ "url": "https://www.bbc.com/news/articles/example" }
```

**Response:**
```json
{
  "total": 45,
  "words": [
    { "word": "climate summit", "weight": 0.98, "sentiment": 0.12 },
    { "word": "carbon emissions", "weight": 0.87, "sentiment": -0.31 }
  ]
}
```

### `GET /health`
Returns `{ "status": "ok" }`.

## Tests

**Backend:**
```bash
cd backend
source venv/bin/activate
python -m pytest tests/test_api.py -v
```

**Frontend:**
```bash
cd frontend
npm test
```

## Project Structure

```
backend/
  main.py              — FastAPI app, CORS, /analyze endpoint
  models/
    schemas.py         — Pydantic request/response schemas
  services/
    crawler.py         — Firecrawl + BeautifulSoup fallback crawler
    nlp.py             — TF-IDF + spaCy NER + VADER + markdown cleaning
  tests/
    test_api.py        — Backend API tests (mocked, offline-safe)
  requirements.txt
  .env.example         — Environment variable template
  .env                 — Local secrets (gitignored)

frontend/
  src/
    App.tsx              — Root state machine (idle/loading/success/error)
    types.ts             — TypeScript interfaces
    hooks/useAnalyze.ts  — API fetch hook (configurable via VITE_API_URL)
    hooks/useAnalyze.test.ts — State flow tests
    components/
      URLInput/          — Gradient mesh landing page + glass card input
      Loader/            — 3D wireframe cube + status messages
      WordCloud/         — Scene, WordSphere, WordMesh, Starfield
      InfoPanel/         — Word detail overlay
  .env.example           — Frontend env template

setup.sh               — One-command setup and launch
```
