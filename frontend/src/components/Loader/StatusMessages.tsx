import { useState, useEffect } from "react";

const MESSAGES = [
  "Firecrawling article...",
  "Cleaning & extracting text...",
  "Running NLP pipeline...",
  "Building 3D space...",
];

export default function StatusMessages() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <p
      style={{
        textAlign: "center",
        color: "rgba(255,255,255,0.5)",
        fontSize: "0.9rem",
        fontFamily: "Inter, sans-serif",
        marginTop: 16,
        transition: "opacity 0.3s",
      }}
    >
      {MESSAGES[index]}
    </p>
  );
}
