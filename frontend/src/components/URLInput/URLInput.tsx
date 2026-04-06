import { useState } from "react";
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

export default function URLInput({ onSubmit, disabled }: URLInputProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = () => {
    const trimmed = url.trim();
    if (trimmed) onSubmit(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !disabled) handleSubmit();
  };

  return (
    <div className="url-input-container">
      <h1 className="url-input-title">3D Word Cloud</h1>
      <p className="url-input-subtitle">
        Paste a news article URL to visualize its topics in 3D
      </p>

      <div className="url-input-wrapper">
        <input
          className="url-input-field"
          type="url"
          placeholder="https://example.com/article..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <button
          className="url-input-btn"
          onClick={handleSubmit}
          disabled={disabled || !url.trim()}
        >
          Analyze
        </button>
      </div>

      <div className="url-chips">
        {SAMPLE_URLS.map((sample) => (
          <button
            key={sample.label}
            className="url-chip"
            onClick={() => {
              setUrl(sample.url);
              onSubmit(sample.url);
            }}
            disabled={disabled}
          >
            {sample.label}
          </button>
        ))}
      </div>
    </div>
  );
}
