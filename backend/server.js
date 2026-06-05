

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const { Pinecone } = require("@pinecone-database/pinecone");

// ── CONFIG ──────────────────────────────────────────────────────

const config = {
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || "",
  PINECONE_API_KEY: process.env.PINECONE_API_KEY || "",
  API_KEY: process.env.API_KEY || "",
  CHAT_MODEL: process.env.CHAT_MODEL || "google/gemini-2.5-flash-lite",
  OPENROUTER_BASE: "https://openrouter.ai/api/v1",
  RULES_INDEX: process.env.RULES_INDEX || "mental-health-rules",
  RATE_LIMIT_RPM: parseInt(process.env.RATE_LIMIT_RPM || "30", 10),
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || "60", 10),
  HOST: process.env.HOST || "0.0.0.0",
  PORT: parseInt(process.env.PORT || "5000", 10),
  ENV: process.env.ENVIRONMENT || "development",
  CORS_ORIGINS: (process.env.CORS_ORIGINS || "*").split(",").map((o) => o.trim()),
};

if (!config.OPENROUTER_API_KEY) { console.error("FATAL: OPENROUTER_API_KEY is not set"); process.exit(1); }
if (!config.PINECONE_API_KEY) { console.error("FATAL: PINECONE_API_KEY is not set"); process.exit(1); }

const VERSION = "1.0.0";
const startedAt = Date.now();
const uptimeSeconds = () => +((Date.now() - startedAt) / 1000).toFixed(1);

// ── PROMPT ──────────────────────────────────────────────────────

const ASSESSMENT_SYSTEM =
  "You are MindWell, a professional mental health assessment system.\n\n" +
  "Analyze the user's lifestyle assessment data and health guidelines from our database.\n\n" +
  "Write a SHORT doctor-style note (like a lifestyle prescription, not a medication prescription).\n\n" +
  "Use exactly these sections:\n" +
  "## **Clinical Snapshot**\n" +
  "## **Key Findings**\n" +
  "## **Lifestyle Prescription**\n" +
  "## **Improvement Suggestions**\n" +
  "## **Follow-Up**\n\n" +
  "RULES:\n" +
  "- Keep total length between 130 and 180 words\n" +
  "- Use concise, formal clinical tone\n" +
  "- In Lifestyle Prescription, provide 3-4 numbered, non-medication actions\n" +
  "- In Improvement Suggestions, provide 3-4 short, practical tips for both mental and physical health\n" +
  "- Bold the key action points using **text** markdown format\n" +
  "- Include practical targets (for example sleep hours, activity minutes, screen limits)\n" +
  "- NEVER mention medicines, drugs, supplements, doses, or prescriptions\n" +
  "- NEVER give a diagnosis\n" +
  "- Mention urgent help only if risk indicators are high";

const ASSESSMENT_ERROR =
  "I couldn't analyze your assessment right now. Please try submitting it again.";

// ── CLIENTS ─────────────────────────────────────────────────────

const pinecone = new Pinecone({ apiKey: config.PINECONE_API_KEY });

async function chatCompletion(messages, { temperature = 0.3, maxTokens = 16000 } = {}) {
  const res = await fetch(`${config.OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: config.CHAT_MODEL, messages, temperature, max_tokens: maxTokens }),
  });
  if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

// ── RETRIEVER ───────────────────────────────────────────────────

function evaluateCondition(condition, assessment) {
  if (!condition || !assessment) return true;
  try {
    const ctx = {
      sleep: parseFloat(assessment.sleep || 0),
      screen: parseFloat(assessment.screen || 0),
      mood: String(assessment.mood || "sometimes").toLowerCase(),
      weekendScreen: parseFloat(assessment.weekendScreen || 0),
      deviceAnxiety: String(assessment.deviceAnxiety || "never").toLowerCase(),
      academicSatisfaction: String(assessment.academicSatisfaction || "").toLowerCase(),
    };
    const parts = condition.toUpperCase().split("AND").map((p) => p.trim());
    for (let part of parts) {
      for (const f of ["sleep", "screen", "mood", "weekendScreen", "deviceAnxiety", "academicSatisfaction"]) part = part.replace(new RegExp(f, "gi"), f);
      const ops = [">=", "<=", "!=", "==", ">", "<"];
      let matched = false;
      for (const op of ops) {
        if (!part.includes(op)) continue;
        const [field, value] = part.split(op).map((s) => s.trim());
        const fv = ctx[field], nv = parseFloat(value);
        const isNum = !isNaN(nv) && !isNaN(fv);
        if (op === "==" && isNum && fv !== nv) return false;
        if (op === "==" && !isNum && String(fv).replace(/['"]/g, "") !== value.toLowerCase().replace(/['"]/g, "")) return false;
        if (op === "!=" && isNum && fv === nv) return false;
        if (op === ">=" && parseFloat(fv) < nv) return false;
        if (op === "<=" && parseFloat(fv) > nv) return false;
        if (op === ">" && parseFloat(fv) <= nv) return false;
        if (op === "<" && parseFloat(fv) >= nv) return false;
        matched = true; break;
      }
      if (!matched) return false;
    }
    return true;
  } catch { return false; }
}

async function searchByAssessment(assessment) {
  const index = pinecone.Index(config.RULES_INDEX);
  
  // Fetch ALL records from Pinecone (no embedding needed)
  const allIds = [];
  let paginationToken = undefined;
  
  // List all vector IDs with pagination
  do {
    const listResult = await index.listPaginated({ paginationToken });
    const ids = listResult.vectors?.map(v => v.id) || [];
    allIds.push(...ids);
    paginationToken = listResult.pagination?.next;
  } while (paginationToken);
  
  if (allIds.length === 0) return [];
  
  // Fetch all vectors with metadata in batches (Pinecone limit: 1000 per fetch)
  const allRecords = [];
  const batchSize = 1000;
  for (let i = 0; i < allIds.length; i += batchSize) {
    const batchIds = allIds.slice(i, i + batchSize);
    const fetchResult = await index.fetch(batchIds);
    allRecords.push(...Object.values(fetchResult.records || {}));
  }
  
  // Return ALL rules - model will use all context
  return allRecords.map((m) => ({
    ruleId: m.id || "",
    text: m.metadata?.text || "",
    condition: m.metadata?.condition || "",
    healthDimension: m.metadata?.health_dimension || "",
    ruleType: m.metadata?.rule_type || "",
  }));
}

// ── ASSESSMENT LOGIC ────────────────────────────────────────────

async function processAssessment(assessment) {
  const start = Date.now();
  const allRules = await searchByAssessment(assessment);

  const sanitizeAssessmentText = (text) => {
    const banned = /(medicine|medication|drug|supplement|dose|dosage|tablet|pill|capsule|prescription)/i;
    const lines = String(text || "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .filter((l) => !banned.test(l));
    return lines.join("\n");
  };

  const rulesCtx = allRules.length > 0
    ? "HEALTH DATABASE RULES (all rules — use these to inform the report):\n" +
      allRules.map((r, i) =>
        `${i + 1}. [${(r.healthDimension || "general").toUpperCase()}] ${r.text}` +
        (r.condition ? ` (condition: ${r.condition})` : "")
      ).join("\n")
    : "No rules found in database.";

  const answerRaw = await chatCompletion([
    { role: "system", content: ASSESSMENT_SYSTEM },
    {
      role: "user",
      content:
        `USER'S LIFESTYLE ASSESSMENT:\n` +
        `- Sleep: ${assessment.sleep} hours/night\n` +
        `- Usual Bedtime: ${assessment.bedtime || "not specified"}\n` +
        `- Screen Time (weekday): ${assessment.screen} hours/day\n` +
        `- Screen Time (weekend): ${assessment.weekendScreen} hours/day\n` +
        `- Primary Device: ${assessment.primaryDevice || "not specified"}\n` +
        `- Device Anxiety: ${assessment.deviceAnxiety || "not specified"}\n` +
        `- Low Mood Frequency: ${assessment.mood}\n` +
        `- Academic Satisfaction: ${assessment.academicSatisfaction || "not specified"}\n\n` +
        `${rulesCtx}\n\n` +
        `Using ALL the rules above as your knowledge base, write a personalised doctor-note style wellness report for this user. Apply only the rules relevant to their data. No medication suggestions.`,
    },
  ]);
  const answer = sanitizeAssessmentText(answerRaw);

  return {
    summary: answer,
    recommendations: answer,
    matchedRules: allRules,
    processingTimeMs: Date.now() - start,
  };
}

// ── VALIDATION & HELPERS ────────────────────────────────────────

const stats = { total: 0, errors: 0 };
const _feedbackStore = [];

function validateAssessment(a) {
  if (!a || typeof a !== "object") return "Assessment is required";
  if (typeof a.sleep !== "number" || a.sleep < 0 || a.sleep > 24) return "Sleep must be 0-24";
  if (typeof a.screen !== "number" || a.screen < 0 || a.screen > 24) return "Screen must be 0-24";
  if (typeof a.weekendScreen !== "number" || a.weekendScreen < 0 || a.weekendScreen > 24) return "Weekend screen time must be 0-24";
  const validMoods = ["rarely", "sometimes", "often"];
  if (!validMoods.includes(String(a.mood || "").toLowerCase().trim())) return "Mood must be: rarely, sometimes, or often";
  a.mood = String(a.mood).toLowerCase().trim();
  const validAnxiety = ["never", "sometimes", "often", "always"];
  if (a.deviceAnxiety && !validAnxiety.includes(String(a.deviceAnxiety).toLowerCase().trim())) return "deviceAnxiety must be: never, sometimes, often, or always";
  return null;
}

const rateStore = new Map();
function isRateLimited(key) {
  const now = Date.now(), window = config.RATE_LIMIT_WINDOW * 1000;
  let ts = (rateStore.get(key) || []).filter((t) => now - t < window);
  if (ts.length >= config.RATE_LIMIT_RPM) { rateStore.set(key, ts); return true; }
  ts.push(now); rateStore.set(key, ts); return false;
}

// ── EXPRESS APP ─────────────────────────────────────────────────

const app = express();

app.use(cors({
  origin: config.CORS_ORIGINS.includes("*") ? "*" : config.CORS_ORIGINS,
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "X-API-Key"],
}));
app.use(express.json({ limit: "1mb" }));

function verifyApiKey(req, res, next) {
  if (!config.API_KEY) return next();
  if (req.headers["x-api-key"] !== config.API_KEY) return res.status(401).json({ detail: "Invalid API key" });
  next();
}

// ── ROUTES ──────────────────────────────────────────────────────

app.post("/api/assess", verifyApiKey, async (req, res) => {
  const clientIp = req.ip || "unknown";
  if (isRateLimited(clientIp)) return res.status(429).json({ detail: "Too many requests. Please wait." });

  const { assessment } = req.body;
  const err = validateAssessment(assessment);
  if (err) return res.status(422).json({ detail: err });

  try {
    stats.total++;
    const result = await processAssessment(assessment);
    res.json(result);
  } catch (e) {
    console.error("Assessment failed:", e.message);
    stats.errors++;
    res.json({ summary: ASSESSMENT_ERROR, recommendations: "", matchedRules: [], riskLevel: "low", processingTimeMs: 0, error: true });
  }
});

app.get("/api/health", async (_req, res) => {
  const checks = {};
  try { await pinecone.listIndexes(); checks.pinecone = "ok"; } catch (e) { checks.pinecone = `error: ${String(e.message).slice(0, 80)}`; }
  checks.openrouter = config.OPENROUTER_API_KEY.startsWith("sk-") ? "ok" : "warning: key format";
  const ok = Object.values(checks).every((v) => v === "ok");
  res.json({ status: ok ? "ok" : "degraded", version: VERSION, uptimeSeconds: uptimeSeconds(), dependencies: checks });
});

app.get("/api/stats", verifyApiKey, (_req, res) => {
  res.json({ totalAssessments: stats.total, totalErrors: stats.errors, uptimeSeconds: uptimeSeconds() });
});

app.post("/api/feedback", verifyApiKey, (req, res) => {
  const { rating, comment } = req.body;
  if (!["up", "down"].includes(rating)) return res.status(422).json({ detail: "rating must be 'up' or 'down'" });
  const id = uuidv4().slice(0, 12);
  _feedbackStore.push({ id, rating, comment: comment || null, ts: new Date().toISOString() });
  res.json({ status: "ok", feedbackId: id });
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled:", err);
  res.status(500).json({ detail: "Something went wrong." });
});

// ── START ────────────────────────────────────────────────────────

app.listen(config.PORT, config.HOST, () => {
  console.log("=".repeat(50));
  console.log(`  MindWell Health Assessment API  v${VERSION}`);
  console.log("=".repeat(50));
  console.log(`  LLM       : ${config.CHAT_MODEL}`);
  console.log(`  Rules     : ${config.RULES_INDEX}`);
  console.log(`  Auth      : ${config.API_KEY ? "enabled" : "disabled"}`);
  console.log("=".repeat(50));
  console.log(`  → http://${config.HOST}:${config.PORT}`);
  console.log();
});

process.on("SIGINT", () => { console.log("\nBye!"); process.exit(0); });
process.on("SIGTERM", () => { console.log("Bye!"); process.exit(0); });
