import React, { useState } from "react";
import AssessmentPage from "./AssessmentPage";
import LoadingPage from "./LoadingPage";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAssessment = async (data) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/assess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessment: data }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.summary);
      setResult(json);
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-white">
      {loading ? (
        <LoadingPage />
      ) : (
        <AssessmentPage
          onSubmit={handleAssessment}
          result={result}
          error={error}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
