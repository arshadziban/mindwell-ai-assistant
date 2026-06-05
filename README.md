# Mind Well — AI Mental Health Assessment

![Mind Well Logo](frontend/public/logo_horizontal.png)

> A full-stack web app that analyzes lifestyle indicators and delivers personalized, wellness reports powered by Google Gemini AI.

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


## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Tailwind CSS, React Markdown, html2pdf.js |
| Backend | Node.js, Express.js |
| AI Model | Google Gemini 2.5 Flash (via OpenRouter) |
| Knowledge Base | Pinecone vector database |




