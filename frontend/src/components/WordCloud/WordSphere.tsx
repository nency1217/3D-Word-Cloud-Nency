import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { WordData } from "../../types";
import WordMesh from "./WordMesh";

interface WordSphereProps {
  words: WordData[];
  onWordClick: (word: WordData) => void;
}

function fibonacciSphere(n: number, radius: number): THREE.Vector3[] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: n }, (_, i) => {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    return new THREE.Vector3(
      Math.cos(theta) * r * radius,
      y * radius,
      Math.sin(theta) * r * radius
    );
  });
}

export default function WordSphere({ words, onWordClick }: WordSphereProps) {
  const groupRef = useRef<THREE.Group>(null);
  const positions = fibonacciSphere(words.length, 5);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  return (
    <Float speed={0.5} rotationIntensity={0.2}>
      <group ref={groupRef}>
        {words.map((word, i) => (
          <WordMesh
            key={word.word}
            word={word.word}
            weight={word.weight}
            sentiment={word.sentiment}
            position={positions[i]}
            onClick={() => onWordClick(word)}
          />
        ))}
      </group>
    </Float>
  );
}
