import { useState } from "react";
import { WordData } from "./types";
import useAnalyze from "./hooks/useAnalyze";
import URLInput from "./components/URLInput/URLInput";
import Loader3D from "./components/Loader/Loader3D";
import Scene from "./components/WordCloud/Scene";
import InfoPanel from "./components/InfoPanel/InfoPanel";

function App() {
  const { appState, words, error, analyze, reset } = useAnalyze();
  const [selectedWord, setSelectedWord] = useState<WordData | null>(null);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {appState === "idle" && <URLInput onSubmit={analyze} />}

      {appState === "loading" && <Loader3D />}

      {appState === "success" && (
        <>
          <Scene words={words} onWordClick={setSelectedWord} />
          <InfoPanel word={selectedWord} onClose={() => setSelectedWord(null)} />

          {/* Back button */}
          <button
            onClick={() => {
              setSelectedWord(null);
              reset();
            }}
            style={{
              position: "absolute",
              top: 24,
              left: 24,
              zIndex: 20,
              padding: "8px 16px",
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: "0.8rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: "rgba(255,255,255,0.6)",
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(16px)",
              border: "0.5px solid rgba(255,255,255,0.12)",
              borderRadius: 8,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#00f5ff";
              e.currentTarget.style.borderColor = "rgba(0,245,255,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.6)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
            }}
          >
            &larr; New URL
          </button>
        </>
      )}

      {appState === "error" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            gap: 16,
          }}
        >
          <div
            style={{
              background: "rgba(255, 68, 102, 0.1)",
              backdropFilter: "blur(24px)",
              border: "0.5px solid rgba(255, 68, 102, 0.3)",
              borderRadius: 16,
              padding: "20px 32px",
              textAlign: "center",
              maxWidth: 420,
            }}
          >
            <p style={{ color: "#ff4466", fontSize: "0.95rem", marginBottom: 16 }}>
              {error}
            </p>
            <button
              onClick={reset}
              style={{
                padding: "10px 24px",
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: 700,
                fontSize: "0.85rem",
                letterSpacing: "0.08em",
                color: "#050505",
                background: "linear-gradient(135deg, #00f5ff, #00ffab)",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
