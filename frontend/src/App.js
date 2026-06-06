import React, { useState, useEffect } from "react";
import AssessmentPage from "./AssessmentPage";
import LoadingPage from "./LoadingPage";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function App() {
  const [page, setPage] = useState("form"); // "form" | "loading" | "result"
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loadingDone, setLoadingDone] = useState(false);

  // Warm up the Render server on page load so it's ready when user submits
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/health`, { method: "GET" }).catch(() => {});
  }, []);

  const handleAssessment = async (data) => {
    setPage("loading");
    setLoadingDone(false);
    setError(null);
    const body = JSON.stringify({ assessment: data });
    let lastError;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000);
        const res = await fetch(`${API_BASE_URL}/api/assess`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          signal: controller.signal,
        });
        clearTimeout(timeout);
        const json = await res.json();
        if (json.error) throw new Error(json.summary);
        setResult(json);
        // Signal loader to play completion animation, then switch page
        setLoadingDone(true);
        return;
      } catch (e) {
        lastError = e;
        if (attempt < 2) await new Promise((r) => setTimeout(r, 5000));
      }
    }
    setError(lastError?.message || "Something went wrong. Please try again.");
    setPage("form");
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setPage("form");
  };

  return (
    <div className="min-h-screen bg-white">
      {page === "loading" ? (
        <LoadingPage done={loadingDone} onComplete={() => setPage("result")} />
      ) : (
        <AssessmentPage
          onSubmit={handleAssessment}
          result={page === "result" ? result : null}
          error={error}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
