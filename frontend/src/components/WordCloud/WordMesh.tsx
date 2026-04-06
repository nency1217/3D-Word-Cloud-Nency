import { useState, useCallback } from "react";
import { Text } from "@react-three/drei";
import { animated, useSpring } from "@react-spring/three";
import { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

interface WordMeshProps {
  word: string;
  weight: number;
  sentiment: number;
  position: THREE.Vector3;
  onClick: () => void;
}

function getWordColor(weight: number): string {
  if (weight > 0.75) return "#00f5ff";  // cyan
  if (weight > 0.45) return "#ff00cc";  // magenta
  return "#00ffab";                      // mint
}

const AnimatedText = animated(Text);

export default function WordMesh({
  word,
  weight,
  position,
  onClick,
}: WordMeshProps) {
  const [hovered, setHovered] = useState(false);
  const color = getWordColor(weight);
  const fontSize = 0.12 + weight * 0.5;

  const { scale } = useSpring({
    scale: hovered ? 1.3 : 1,
    config: { tension: 300, friction: 20 },
  });

  const handlePointerEnter = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
  }, []);

  const handlePointerLeave = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = "default";
  }, []);

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick();
  }, [onClick]);

  return (
    <AnimatedText
      position={[position.x, position.y, position.z]}
      fontSize={fontSize}
      color={color}
      anchorX="center"
      anchorY="middle"
      // @ts-ignore — animated scale
      scale={scale}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
    >
      {word}
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={hovered ? weight * 4 : weight * 2}
        toneMapped={false}
      />
    </AnimatedText>
  );
}
