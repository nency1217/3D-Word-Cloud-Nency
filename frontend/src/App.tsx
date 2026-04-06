import { useState } from "react";
import { WordData, AppState } from "./types";

function App() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [words, setWords] = useState<WordData[]>([]);
  const [error, setError] = useState<string>("");

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {/* Components will be wired in later commits */}
      <h1 style={{ textAlign: "center", paddingTop: "40vh", color: "var(--cyan)" }}>
        3D Word Cloud
      </h1>
    </div>
  );
}

export default App;
