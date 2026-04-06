import { motion, AnimatePresence } from "framer-motion";
import { WordData } from "../../types";

interface InfoPanelProps {
  word: WordData | null;
  onClose: () => void;
}

function getSentimentLabel(s: number): { text: string; color: string } {
  if (s > 0.2) return { text: "Positive", color: "#00ffab" };
  if (s < -0.2) return { text: "Negative", color: "#ff4466" };
  return { text: "Neutral", color: "rgba(255,255,255,0.5)" };
}

function getWeightLabel(w: number): string {
  if (w > 0.75) return "High";
  if (w > 0.45) return "Medium";
  return "Low";
}

export default function InfoPanel({ word, onClose }: InfoPanelProps) {
  const sentiment = word ? getSentimentLabel(word.sentiment) : null;

  return (
    <AnimatePresence>
      {word && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25 }}
          style={{
            position: "absolute",
            bottom: 32,
            left: 32,
            zIndex: 20,
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            border: "0.5px solid rgba(255, 255, 255, 0.12)",
            borderRadius: 16,
            padding: "20px 24px",
            minWidth: 260,
            boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "1.2rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "#00f5ff",
                margin: 0,
              }}
            >
              {word.word}
            </h3>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.4)",
                fontSize: "1.2rem",
                cursor: "pointer",
                padding: "0 4px",
              }}
            >
              x
            </button>
          </div>

          {/* Weight bar */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>
                Relevance
              </span>
              <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)" }}>
                {getWeightLabel(word.weight)} ({(word.weight * 100).toFixed(0)}%)
              </span>
            </div>
            <div
              style={{
                height: 4,
                borderRadius: 2,
                background: "rgba(255,255,255,0.1)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${word.weight * 100}%`,
                  borderRadius: 2,
                  background: "linear-gradient(90deg, #00f5ff, #ff00cc)",
                }}
              />
            </div>
          </div>

          {/* Sentiment */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>
              Sentiment
            </span>
            <span style={{ fontSize: "0.75rem", color: sentiment!.color, fontWeight: 500 }}>
              {sentiment!.text} ({word.sentiment > 0 ? "+" : ""}{word.sentiment.toFixed(2)})
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
