export interface WordData {
  word: string;
  weight: number;     // 0.0 to 1.0
  sentiment: number;  // -1.0 to 1.0
}

export interface AnalyzeResponse {
  words: WordData[];
  total: number;
}

export type AppState = "idle" | "loading" | "success" | "error";
