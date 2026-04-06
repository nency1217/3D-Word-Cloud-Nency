import { useState, useCallback } from "react";
import { WordData, AppState } from "../types";

const API_URL = "http://localhost:8000";

interface UseAnalyzeReturn {
  appState: AppState;
  words: WordData[];
  error: string;
  analyze: (url: string) => Promise<void>;
  reset: () => void;
}

export default function useAnalyze(): UseAnalyzeReturn {
  const [appState, setAppState] = useState<AppState>("idle");
  const [words, setWords] = useState<WordData[]>([]);
  const [error, setError] = useState("");

  const analyze = useCallback(async (url: string) => {
    setAppState("loading");
    setError("");
    setWords([]);

    try {
      const resp = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.detail || `Server error (${resp.status})`);
      }

      const data = await resp.json();
      setWords(data.words);
      setAppState("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      setAppState("error");
    }
  }, []);

  const reset = useCallback(() => {
    setAppState("idle");
    setWords([]);
    setError("");
  }, []);

  return { appState, words, error, analyze, reset };
}
