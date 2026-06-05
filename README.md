# Mind Well — AI Mental Health Assessment

> A full-stack web app that analyzes lifestyle indicators and delivers personalized, doctor-style wellness reports powered by Google Gemini AI.

---

## Overview

Mind Well collects five lifestyle data points from the user, retrieves relevant clinical rules from a Pinecone vector database, and passes everything to a large language model to generate a structured wellness report — no diagnosis, no medication, just actionable guidance.

**Assessment inputs**

| Field | Description |
|---|---|
| Sleep | Hours per night + usual bedtime |
| Screen Time | Weekday and weekend hours, primary device |
| Device Anxiety | How often devices cause stress |
| Mood | Low-mood frequency (rarely / sometimes / often) |
| Academic Satisfaction | Self-reported study/work satisfaction |

**Report sections**

- Clinical Snapshot
- Key Findings
- Lifestyle Prescription
- Improvement Suggestions
- Follow-Up

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Tailwind CSS, React Markdown, html2pdf.js |
| Backend | Node.js, Express.js |
| AI Model | Google Gemini 2.5 Flash (via OpenRouter) |
| Knowledge Base | Pinecone vector database |

---

## Project Structure

```
app/
├── frontend/
│   ├── public/               # Static assets, favicon, manifest
│   └── src/
│       ├── App.js            # Root component, API calls
│       ├── AssessmentPage.js # Form + results UI
│       ├── LoadingPage.js    # Animated loading screen
│       ├── index.js          # Entry point
│       └── index.css         # Global styles
│
└── backend/
    ├── server.js             # Express app, routes, AI logic
    └── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 16+
- [OpenRouter](https://openrouter.ai) API key
- [Pinecone](https://pinecone.io) API key with an index named `mental-health-rules`

### 1. Backend

```bash
cd backend
cp .env.example .env   # fill in your keys
npm install
npm start
```

Server starts at `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

App opens at `http://localhost:3000`.

---

## Environment Variables

### Backend — `backend/.env`

```env
OPENROUTER_API_KEY=sk-or-...
PINECONE_API_KEY=pcsk-...
RULES_INDEX=mental-health-rules

PORT=5000
HOST=0.0.0.0
CHAT_MODEL=google/gemini-2.5-flash-lite
RATE_LIMIT_RPM=30
CORS_ORIGINS=http://localhost:3000

# Optional: protect endpoints with a shared secret
API_KEY=
```

### Frontend — `frontend/.env`

```env
REACT_APP_API_URL=http://localhost:5000
```

---

## API Reference

### `POST /api/assess`

Submit a lifestyle assessment and receive a wellness report.

**Request body**

```json
{
  "assessment": {
    "sleep": 6,
    "bedtime": "12:00 AM",
    "screen": 5,
    "weekendScreen": 7,
    "primaryDevice": "phone",
    "deviceAnxiety": "sometimes",
    "mood": "often",
    "academicSatisfaction": "neutral"
  }
}
```

**Response**

```json
{
  "summary": "## **Clinical Snapshot**\n...",
  "recommendations": "...",
  "matchedRules": [...],
  "processingTimeMs": 1840
}
```

---

### `GET /api/health`

Returns server status and dependency health checks.

```json
{
  "status": "ok",
  "version": "1.0.0",
  "uptimeSeconds": 342.5,
  "dependencies": {
    "pinecone": "ok",
    "openrouter": "ok"
  }
}
```

---

### `GET /api/stats` _(requires API key)_

Returns usage counters.

---

### `POST /api/feedback` _(requires API key)_

Record a thumbs-up / thumbs-down rating.

```json
{ "rating": "up", "comment": "Very helpful!" }
```

---

## Deployment

### Frontend — Vercel / Netlify

```bash
cd frontend
npm run build
# deploy the build/ folder
```

Set `REACT_APP_API_URL` to your production backend URL in the platform's environment settings.

### Backend — Railway / Render / Heroku

Push the `backend/` directory and set all environment variables in the platform dashboard.

```bash
heroku create mindwell-api
heroku config:set OPENROUTER_API_KEY=... PINECONE_API_KEY=...
git push heroku main
```

---

## Security Notes

- Never commit `.env` files — they are listed in `.gitignore`.
- Set `CORS_ORIGINS` to your exact frontend domain in production.
- Enable `API_KEY` auth on stat and feedback endpoints in production.
- Always serve the backend over HTTPS in production.

---

## Troubleshooting

**Port already in use**
Change `PORT` in `backend/.env`. The React dev server auto-increments to 3001 if 3000 is taken.

**`FATAL: OPENROUTER_API_KEY is not set`**
The server will refuse to start without both API keys. Double-check your `.env` file.

**Blank or error report**
Check the browser console and backend logs. Most failures are API key or Pinecone index name mismatches.

**Dependency issues**
```bash
rm -rf node_modules && npm install
```

---

## License

© 2026 Mind Well. All rights reserved.
