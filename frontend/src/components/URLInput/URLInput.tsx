import { useState, useCallback } from "react";
import "./URLInput.css";

const SAMPLE_URLS = [
  { label: "BBC News", url: "https://www.bbc.com/news/articles/c9dl9lrelg2o" },
  { label: "TechCrunch", url: "https://techcrunch.com/2024/06/10/openai-chief-scientist-ilya-sutskever-leaving/" },
  { label: "Wired", url: "https://www.wired.com/story/ai-safety-anthropic-alignment/" },
  { label: "Reuters", url: "https://www.reuters.com/technology/artificial-intelligence/" },
  { label: "The Verge", url: "https://www.theverge.com/2024/6/10/apple-intelligence-wwdc" },
];

interface URLInputProps {
  onSubmit: (url: string) => void;
  disabled?: boolean;
}

function isValidUrl(str: string): boolean {
  try {
    const u = new URL(str);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function URLInput({ onSubmit, disabled }: URLInputProps) {
  const [url, setUrl] = useState(SAMPLE_URLS[0].url);
  const [touched, setTouched] = useState(false);

  const valid = isValidUrl(url.trim());
  const showError = touched && url.trim().length > 0 && !valid;

  const handleSubmit = useCallback(() => {
    const trimmed = url.trim();
    if (trimmed && isValidUrl(trimmed)) onSubmit(trimmed);
  }, [url, onSubmit]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !disabled) handleSubmit();
  };

  return (
    <div className="homepage">
      {/* Animated background */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
      <div className="grid-overlay" />

      {/* ===== Hero Section ===== */}
      <section className="hero-section">
        <div className="badge">
          <span className="badge-dot" />
          AI-POWERED NLP
        </div>

        <h1 className="headline">
          See What Any<br />
          <span className="headline-gradient">Article Is Really About</span>
        </h1>
        <p className="hero-subtitle">
          Paste a URL. Watch topics emerge in 3D.
        </p>

        {/* Glass Card */}
        <div className="glass-card">
          <div className="card-label">Enter Article URL</div>
          <div className="input-row">
            <input
              className={`url-input-field${showError ? " input-error" : ""}`}
              type="url"
              placeholder="https://www.bbc.com/news/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={() => setTouched(true)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
            />
            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={disabled || !valid}
              title="Analyze"
            >
              &#x27A4;
            </button>
          </div>
          <div className="validation-hint">
            {showError ? "Please enter a valid URL (https://...)" : ""}
          </div>
          <div className="url-chips">
            {SAMPLE_URLS.map((sample) => (
              <button
                key={sample.label}
                className="url-chip"
                onClick={() => {
                  setUrl(sample.url);
                  setTouched(false);
                  onSubmit(sample.url);
                }}
                disabled={disabled}
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feature pills */}
        <div className="features">
          <div className="feature">
            <span className="feature-dot" style={{ background: "#00f5ff", boxShadow: "0 0 6px #00f5ff" }} />
            TF-IDF Keywords
          </div>
          <div className="feature">
            <span className="feature-dot" style={{ background: "#ff00cc", boxShadow: "0 0 6px #ff00cc" }} />
            Named Entities
          </div>
          <div className="feature">
            <span className="feature-dot" style={{ background: "#00ffab", boxShadow: "0 0 6px #00ffab" }} />
            Sentiment Analysis
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator">
          <span>Scroll to learn more</span>
          <div className="scroll-arrow" />
        </div>
      </section>

      {/* ===== How It Works ===== */}
      <div className="info-sections">
        <div className="section-title">
          <h2>How It Works</h2>
          <p>Three steps from URL to immersive visualization</p>
        </div>

        <div className="steps">
          <div className="step-card" style={{ "--step-color": "rgba(0,245,255,0.3)" } as React.CSSProperties}>
            <div className="step-number" style={{ color: "#00f5ff" }}>01</div>
            <h3>Crawl &amp; Extract</h3>
            <p>Firecrawl fetches the article and strips away ads, navigation, and boilerplate — leaving only clean content.</p>
          </div>
          <div className="step-card" style={{ "--step-color": "rgba(255,0,204,0.3)" } as React.CSSProperties}>
            <div className="step-number" style={{ color: "#ff00cc" }}>02</div>
            <h3>NLP Pipeline</h3>
            <p>TF-IDF extracts keywords, spaCy identifies named entities, and VADER scores sentiment for each term.</p>
          </div>
          <div className="step-card" style={{ "--step-color": "rgba(0,255,171,0.3)" } as React.CSSProperties}>
            <div className="step-number" style={{ color: "#00ffab" }}>03</div>
            <h3>3D Visualization</h3>
            <p>Words are arranged on a fibonacci sphere, sized by relevance, colored by weight, and rendered with bloom effects.</p>
          </div>
        </div>

        {/* ===== Features Detail ===== */}
        <div className="info-section">
          <div className="info-text">
            <h2>Interactive Exploration</h2>
            <p>
              Orbit around the word cloud by dragging. Hover over any word to see it glow and scale up.
              Click a word to reveal its relevance score, sentiment analysis, and context — all in a
              glassmorphic detail panel.
            </p>
          </div>
          <div className="info-visual">
            <svg width="200" height="160" viewBox="0 0 200 160">
              <circle cx="100" cy="80" r="60" stroke="rgba(0,245,255,0.2)" strokeWidth="1" fill="none" />
              <circle cx="100" cy="80" r="40" stroke="rgba(255,0,204,0.15)" strokeWidth="1" fill="none" />
              <text x="70" y="55" fill="#00f5ff" fontSize="14" fontWeight="700" fontFamily="Space Grotesk">AI</text>
              <text x="110" y="75" fill="#ff00cc" fontSize="10" fontFamily="Space Grotesk">climate</text>
              <text x="55" y="95" fill="#00ffab" fontSize="8" fontFamily="Space Grotesk">energy</text>
              <text x="115" y="105" fill="#00f5ff" fontSize="12" fontWeight="700" fontFamily="Space Grotesk">policy</text>
              <text x="80" y="120" fill="#ff00cc" fontSize="7" fontFamily="Space Grotesk">summit</text>
            </svg>
          </div>
        </div>

        <div className="info-section reverse">
          <div className="info-text">
            <h2>Smart Keyword Extraction</h2>
            <p>
              The NLP pipeline combines TF-IDF statistical weighting with spaCy named entity recognition.
              Named entities like people, organizations, and locations get a relevance boost.
              VADER sentiment analysis adds emotional context to every keyword.
            </p>
          </div>
          <div className="info-visual">
            <div style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 2 }}>
              <span style={{ color: "#00f5ff" }}>{"{ "}</span>
              <span style={{ color: "#ff00cc" }}>"word"</span>: "climate summit",<br />
              &nbsp;&nbsp;<span style={{ color: "#ff00cc" }}>"weight"</span>: <span style={{ color: "#00ffab" }}>0.98</span>,<br />
              &nbsp;&nbsp;<span style={{ color: "#ff00cc" }}>"sentiment"</span>: <span style={{ color: "#00ffab" }}>0.12</span><br />
              <span style={{ color: "#00f5ff" }}>{"}"}</span>
            </div>
          </div>
        </div>

        {/* ===== Tech Stack ===== */}
        <div className="section-title" style={{ marginTop: 40 }}>
          <h2>Built With</h2>
          <p>Modern stack for real-time NLP visualization</p>
        </div>

        <div className="tech-grid">
          <div className="tech-item">
            <h4>React + TypeScript</h4>
            <p>Type-safe UI framework</p>
          </div>
          <div className="tech-item">
            <h4>React Three Fiber</h4>
            <p>Declarative 3D rendering</p>
          </div>
          <div className="tech-item">
            <h4>FastAPI</h4>
            <p>Async Python backend</p>
          </div>
          <div className="tech-item">
            <h4>spaCy</h4>
            <p>Named entity recognition</p>
          </div>
          <div className="tech-item">
            <h4>scikit-learn</h4>
            <p>TF-IDF keyword extraction</p>
          </div>
          <div className="tech-item">
            <h4>Three.js + Bloom</h4>
            <p>Post-processing effects</p>
          </div>
        </div>

        {/* Footer */}
        <footer className="page-footer">
          <p>3D Word Cloud &middot; Built with React Three Fiber &amp; FastAPI</p>
        </footer>
      </div>
    </div>
  );
}
