# MindWell — AI Mental Health Assessment

![MindWell Logo](frontend/public/logo_horizontal.png)

> A full-stack web application that collects lifestyle data, retrieves clinical rules from a Pinecone vector database, and generates a personalized wellness report using Google Gemini AI.

**Live Demo:** [https://arshadziban.github.io/mindwell-ai-assistant/](https://arshadziban.github.io/mindwell-ai-assistant/)

---

## Overview

MindWell collects lifestyle data from the user across three categories — screen and digital usage, sleep, and mental health indicators. The backend fetches all rules from a Pinecone vector database, filters them against the user's data, and passes everything to a large language model to produce a short, structured wellness report. No diagnosis, no medication — just actionable lifestyle guidance.

---

## Assessment Inputs

| Section | Fields |
|---|---|
| Screen & Digital Usage | Weekday screen time (hours), weekend screen time (hours), primary device |
| Sleep & Physical Health | Average sleep duration (hours), usual bedtime |
| Mental & Psychological | Device anxiety level, academic satisfaction |

---

## Report Structure

The AI generates a 130–180 word doctor-style note with exactly five sections:

1. **Clinical Snapshot** — high-level summary of the lifestyle profile
2. **Key Findings** — specific patterns identified from the assessment
3. **Lifestyle Prescription** — 3–4 numbered, non-medication actions with concrete targets
4. **Improvement Suggestions** — 3–4 practical tips for mental and physical health
5. **Follow-Up** — guidance on when to seek additional support

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Tailwind CSS, React Markdown, remark-gfm, html2pdf.js |
| Backend | Node.js (≥ 18), Express.js |
| AI Model | Google Gemini 2.5 Flash Lite via OpenRouter |
| Knowledge Base | Pinecone vector database |

---

## Project Structure

```
app/
├── backend/
│   ├── server.js       # Express API — assess, health, stats, feedback endpoints
│   ├── package.json
│   └── .env            # API keys and config (not committed)
└── frontend/
    ├── public/
    │   └── logo_horizontal.png
    └── src/
        ├── App.js              # Page state machine: form → loading → result
        ├── AssessmentPage.js   # Multi-section form, results view, PDF export
        ├── LoadingPage.js      # Animated globe canvas + progress bar
        ├── index.js
        └── index.css
```

---

## Disclaimer

This tool is for educational wellness guidance only. It does not provide a medical diagnosis, recommend medication, or replace professional mental health care. If symptoms escalate, consult a licensed professional.

---

> Built by [Arshad Ziban](https://github.com/arshadziban)
